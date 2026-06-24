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
