# 30-Day Remembered Login Design

## Goal

After a user logs in or signs up successfully, this browser should keep the user logged in for up to 30 days by default. If the 30-day window expires, the app should treat the user as logged out and redirect through the existing unauthenticated flow. Manual sign-out must immediately clear the remembered-login state.

## Current Context

The app uses Supabase Auth through `src/lib/auth.ts` and creates the browser client in `src/lib/supabase-browser.ts`. Pages call `getCurrentUser()` to decide whether to continue or redirect to `/auth/login`. Supabase already persists sessions in browser storage by default, but the app does not currently enforce a product-level 30-day remembered-login window.

## Recommended Approach

Add an application-level remembered-login expiry in browser storage:

- Store a timestamp that is 30 days after successful `signIn()` or `signUp()`.
- Clear that timestamp on `signOut()`.
- Check that timestamp at the start of `getCurrentUser()`.
- If missing or expired, clear it, call Supabase `signOut()`, and return `null`.
- If valid, continue with the existing Supabase `getUser()` and profile lookup.

This keeps the feature local to the existing auth boundary and avoids a larger server-cookie rewrite.

## Components

### `src/lib/session-retention.ts`

Small utility module for browser-safe session retention:

- `REMEMBER_LOGIN_DAYS = 30`
- `markSessionRememberedFor30Days(now?: number)`
- `clearRememberedSession()`
- `isRememberedSessionValid(now?: number): boolean`

The optional `now` argument exists to make tests deterministic.

### `src/lib/auth.ts`

Update existing auth functions:

- `signIn()` calls `markSessionRememberedFor30Days()` after successful Supabase login.
- `signUp()` calls `markSessionRememberedFor30Days()` after successful Supabase signup and profile creation.
- `signOut()` calls `clearRememberedSession()` before or after Supabase sign-out.
- `getCurrentUser()` calls `isRememberedSessionValid()` before contacting Supabase. If invalid, it clears state, signs out from Supabase, and returns `null`.

## Data Flow

1. User logs in.
2. Supabase stores its session normally.
3. App stores `filmdate:remember-login-until` with a future timestamp.
4. Protected pages call `getCurrentUser()`.
5. `getCurrentUser()` checks the timestamp:
   - valid: proceed with Supabase `getUser()`;
   - expired or absent: clear local state, sign out, return `null`.

## Error Handling

- Browser storage access should be guarded so tests and server-like environments do not crash.
- If storage is unavailable, the remembered-login check should fail closed and return `false`.
- Supabase sign-out during expiry cleanup should be attempted but should not mask the final unauthenticated result.

## Testing

Add focused unit tests for the retention utility:

- stores a timestamp 30 days in the future;
- returns `true` before expiry;
- returns `false` when missing or expired;
- clears remembered state.

Add auth-level tests with mocked Supabase client:

- `signIn()` marks remembered login;
- `signUp()` marks remembered login after profile creation;
- `signOut()` clears remembered login;
- `getCurrentUser()` signs out and returns `null` when the remembered window has expired.

## Non-Goals

- Do not change Supabase dashboard JWT or refresh-token settings from code.
- Do not add a login-page checkbox; remembered login is default behavior.
- Do not implement a custom server-side session system.
