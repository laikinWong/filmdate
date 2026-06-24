# 30-Day Remembered Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add default browser remembered login for 30 days after successful login or signup.

**Architecture:** Keep the behavior inside the existing client auth boundary. A small `session-retention` utility owns the 30-day timestamp in browser storage, and `src/lib/auth.ts` marks, clears, and checks that timestamp around existing Supabase Auth calls.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase Auth, Jest.

---

## File Structure

- Create `src/lib/session-retention.ts`: browser-safe local storage helpers for the 30-day expiry.
- Create `__tests__/session-retention.test.ts`: focused deterministic tests for timestamp storage and validation.
- Create `__tests__/auth.test.ts`: mocked Supabase/auth integration tests.
- Modify `src/lib/auth.ts`: call retention helpers from `signIn`, `signUp`, `signOut`, and `getCurrentUser`.

---

### Task 1: Session Retention Utility

**Files:**
- Create: `src/lib/session-retention.ts`
- Test: `__tests__/session-retention.test.ts`

- [ ] **Step 1: Write the failing utility tests**

Create `__tests__/session-retention.test.ts`:

```ts
import {
  REMEMBER_LOGIN_DAYS,
  REMEMBER_LOGIN_STORAGE_KEY,
  clearRememberedSession,
  isRememberedSessionValid,
  markSessionRememberedFor30Days,
} from '@/lib/session-retention'

describe('session retention', () => {
  const now = Date.UTC(2026, 5, 24)
  const thirtyDaysMs = REMEMBER_LOGIN_DAYS * 24 * 60 * 60 * 1000

  beforeEach(() => {
    localStorage.clear()
  })

  it('stores an expiry timestamp 30 days in the future', () => {
    markSessionRememberedFor30Days(now)

    expect(localStorage.getItem(REMEMBER_LOGIN_STORAGE_KEY)).toBe(String(now + thirtyDaysMs))
  })

  it('returns true before the remembered login expires', () => {
    markSessionRememberedFor30Days(now)

    expect(isRememberedSessionValid(now + thirtyDaysMs - 1)).toBe(true)
  })

  it('returns false when the remembered login is missing', () => {
    expect(isRememberedSessionValid(now)).toBe(false)
  })

  it('returns false when the remembered login is expired', () => {
    markSessionRememberedFor30Days(now)

    expect(isRememberedSessionValid(now + thirtyDaysMs)).toBe(false)
  })

  it('clears remembered login state', () => {
    markSessionRememberedFor30Days(now)

    clearRememberedSession()

    expect(localStorage.getItem(REMEMBER_LOGIN_STORAGE_KEY)).toBeNull()
  })
})
```

- [ ] **Step 2: Run the utility test to verify it fails**

Run:

```bash
npm test -- __tests__/session-retention.test.ts --runInBand
```

Expected: FAIL because `@/lib/session-retention` does not exist.

- [ ] **Step 3: Implement the utility**

Create `src/lib/session-retention.ts`:

```ts
export const REMEMBER_LOGIN_DAYS = 30
export const REMEMBER_LOGIN_STORAGE_KEY = 'filmdate:remember-login-until'

const MS_PER_DAY = 24 * 60 * 60 * 1000

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

export function markSessionRememberedFor30Days(now = Date.now()) {
  const storage = getStorage()
  if (!storage) return

  storage.setItem(
    REMEMBER_LOGIN_STORAGE_KEY,
    String(now + REMEMBER_LOGIN_DAYS * MS_PER_DAY)
  )
}

export function clearRememberedSession() {
  const storage = getStorage()
  if (!storage) return

  storage.removeItem(REMEMBER_LOGIN_STORAGE_KEY)
}

export function isRememberedSessionValid(now = Date.now()): boolean {
  const storage = getStorage()
  if (!storage) return false

  const value = storage.getItem(REMEMBER_LOGIN_STORAGE_KEY)
  if (!value) return false

  const expiresAt = Number(value)
  if (!Number.isFinite(expiresAt)) return false

  return now < expiresAt
}
```

- [ ] **Step 4: Run the utility test to verify it passes**

Run:

```bash
npm test -- __tests__/session-retention.test.ts --runInBand
```

Expected: PASS.

---

### Task 2: Auth Integration

**Files:**
- Modify: `src/lib/auth.ts`
- Test: `__tests__/auth.test.ts`

- [ ] **Step 1: Write failing auth integration tests**

Create `__tests__/auth.test.ts`:

```ts
import { getCurrentUser, signIn, signOut, signUp } from '@/lib/auth'
import {
  REMEMBER_LOGIN_STORAGE_KEY,
  clearRememberedSession,
  markSessionRememberedFor30Days,
} from '@/lib/session-retention'

const authSignUp = jest.fn()
const authSignInWithPassword = jest.fn()
const authSignOut = jest.fn()
const authGetUser = jest.fn()
const from = jest.fn()
const insert = jest.fn()
const select = jest.fn()
const eq = jest.fn()
const single = jest.fn()

jest.mock('@/lib/supabase-browser', () => ({
  createBrowserClient: () => ({
    auth: {
      signUp: authSignUp,
      signInWithPassword: authSignInWithPassword,
      signOut: authSignOut,
      getUser: authGetUser,
    },
    from,
  }),
}))

describe('auth remembered login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()

    insert.mockReturnValue({ error: null })
    single.mockResolvedValue({ data: { id: 'user-1', name: 'Alice' } })
    eq.mockReturnValue({ single })
    select.mockReturnValue({ eq })
    from.mockReturnValue({ insert, select })
  })

  it('marks remembered login after successful sign in', async () => {
    authSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    await signIn('a@example.com', 'secret123')

    expect(localStorage.getItem(REMEMBER_LOGIN_STORAGE_KEY)).not.toBeNull()
  })

  it('marks remembered login after successful sign up and profile creation', async () => {
    authSignUp.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    await signUp('a@example.com', 'secret123', 'Alice')

    expect(localStorage.getItem(REMEMBER_LOGIN_STORAGE_KEY)).not.toBeNull()
  })

  it('clears remembered login on sign out', async () => {
    markSessionRememberedFor30Days()
    authSignOut.mockResolvedValue({})

    await signOut()

    expect(localStorage.getItem(REMEMBER_LOGIN_STORAGE_KEY)).toBeNull()
  })

  it('signs out and returns null when remembered login is missing', async () => {
    authSignOut.mockResolvedValue({})

    await expect(getCurrentUser()).resolves.toBeNull()

    expect(authSignOut).toHaveBeenCalled()
    expect(authGetUser).not.toHaveBeenCalled()
  })

  it('loads the current user when remembered login is valid', async () => {
    markSessionRememberedFor30Days()
    authGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    })

    await expect(getCurrentUser()).resolves.toEqual({ id: 'user-1', name: 'Alice' })

    expect(authGetUser).toHaveBeenCalled()
    expect(from).toHaveBeenCalledWith('users')
  })
})
```

- [ ] **Step 2: Run the auth test to verify it fails**

Run:

```bash
npm test -- __tests__/auth.test.ts --runInBand
```

Expected: FAIL because `signIn`, `signUp`, `signOut`, and `getCurrentUser` do not yet use retention helpers.

- [ ] **Step 3: Integrate retention into auth**

Modify `src/lib/auth.ts`:

```ts
import { createBrowserClient } from './supabase-browser'
import {
  clearRememberedSession,
  isRememberedSessionValid,
  markSessionRememberedFor30Days,
} from './session-retention'

export async function signUp(email: string, password: string, name: string) {
  const supabase = createBrowserClient()

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error
  if (!user) throw new Error('User creation failed')

  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: user.id,
      name,
    })

  if (profileError) throw profileError

  markSessionRememberedFor30Days()

  return user
}

export async function signIn(email: string, password: string) {
  const supabase = createBrowserClient()

  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  markSessionRememberedFor30Days()

  return user
}

export async function signOut() {
  clearRememberedSession()

  const supabase = createBrowserClient()
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const supabase = createBrowserClient()

  if (!isRememberedSessionValid()) {
    clearRememberedSession()
    await supabase.auth.signOut()
    return null
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function getSession() {
  const supabase = createBrowserClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
```

- [ ] **Step 4: Run the auth test to verify it passes**

Run:

```bash
npm test -- __tests__/auth.test.ts --runInBand
```

Expected: PASS.

---

### Task 3: Full Verification

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run all tests**

Run:

```bash
npm test -- --runInBand
```

Expected: all Jest suites pass.

- [ ] **Step 2: Run lint**

Run:

```bash
npm run lint
```

Expected: exit 0 with no lint errors.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: Next.js build and TypeScript check pass.

- [ ] **Step 4: Check diff hygiene**

Run:

```bash
git diff --check
```

Expected: no whitespace errors.
