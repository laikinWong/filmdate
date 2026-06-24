import { getCurrentUser, signIn, signOut, signUp } from '@/lib/auth'
import {
  REMEMBER_LOGIN_STORAGE_KEY,
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
