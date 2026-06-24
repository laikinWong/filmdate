export const REMEMBER_LOGIN_DAYS = 30
export const REMEMBER_LOGIN_STORAGE_KEY = 'filmdate:remember-login-until'

const MS_PER_DAY = 24 * 60 * 60 * 1000

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function markSessionRememberedFor30Days(now = Date.now()) {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.setItem(
      REMEMBER_LOGIN_STORAGE_KEY,
      String(now + REMEMBER_LOGIN_DAYS * MS_PER_DAY)
    )
  } catch {
    // Treat unavailable storage as non-remembered login.
  }
}

export function clearRememberedSession() {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.removeItem(REMEMBER_LOGIN_STORAGE_KEY)
  } catch {
    // Clearing should be best-effort when browser storage is unavailable.
  }
}

export function isRememberedSessionValid(now = Date.now()): boolean {
  const storage = getStorage()
  if (!storage) return false

  let value: string | null
  try {
    value = storage.getItem(REMEMBER_LOGIN_STORAGE_KEY)
  } catch {
    return false
  }

  const expiresAt = Number(value)
  if (!Number.isFinite(expiresAt)) return false

  return now < expiresAt
}
