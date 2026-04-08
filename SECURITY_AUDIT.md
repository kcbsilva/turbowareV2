# TurbowareV2 Security & Code Quality Audit

**Last Updated:** 2026-04-08  
**Scope:** CRITICAL and HIGH security fixes + actionable MEDIUM fixes  
**Status:** 11 of 16 issues resolved in this sprint. See [Implementation Status](#implementation-status) below.

---

## 🔴 CRITICAL Issues

### 1. Hardcoded Default JWT Secret
**Files**: `src/lib/auth.ts:4`, `src/middleware.ts:5`
**Risk**: If `JWT_SECRET` env var isn't set in production, anyone can forge admin/client tokens.
```typescript
const secret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me')
```
**Fix**: Remove the default fallback and fail loudly if missing.
- [x] Remove fallback secret
- [x] Add runtime check in app startup

### 2. Unhandled JSON Parse Errors
**Files**: `/api/client/validate`, `/api/client/activate`, `/api/admin/licenses`, `/api/register`
**Risk**: Malformed JSON returns 500 instead of 400. Creates DoS surface.
**Fix**: Wrap `await req.json()` in try-catch and return `{ status: 400 }`
- [x] Wrap /api/client/validate
- [x] Wrap /api/client/activate
- [x] Wrap /api/admin/licenses/route.ts
- [x] Wrap /api/admin/licenses/[id]/route.ts
- [x] Wrap /api/register/route.ts
- [x] Wrap /api/admin/clients/route.ts
- [x] Wrap /api/admin/clients/[id]/route.ts
- [x] Wrap /api/client/subscription/route.ts
- [x] Wrap /api/client/auth/login/route.ts

### 3. Type Coercion in Seat Validation
**File**: `src/app/api/client/subscription/route.ts:64`
**Risk**: `seats: "abc"` passes validation (coerced to NaN). Non-numeric strings could create invalid subscriptions.
```typescript
if (!seats || seats < 1)
  return NextResponse.json({ error: 'Seat count is required.' }, { status: 400 })
```
**Fix**: Use strict type checking
- [x] Add `typeof seats !== 'number' || !Number.isInteger(seats)` validation

---

## 🟠 HIGH Priority Issues

### 4. Race Condition in License Activation
**File**: `src/app/api/client/activate/route.ts:43-68`
**Risk**: Two concurrent requests with same `hardwareId` could both pass existence check and violate unique constraint.
**Fix**: Use database-level constraint with retry or transaction
- [x] Move activation logic into database transaction
- [x] Add retry logic or upsert pattern

### 5. No Rate Limiting on Auth Endpoints
**Files**: `/api/auth/login`, `/api/client/auth/login`
**Risk**: Unrestricted brute force attacks on passwords.
**Fix**: Add rate limiting (5 attempts per 15 minutes per IP)
- [x] Install rate limiting middleware
- [x] Apply to /api/auth/login
- [x] Apply to /api/client/auth/login

### 6. License Key Enumeration
**File**: `src/app/api/client/status/[key]/route.ts`
**Risk**: Public endpoint returns license metadata without authorization. Attackers can enumerate keys, discover expiry dates, seat counts, map keys to products.
**Fix**: Either remove public access, require API key, or return minimal info
- [x] Add CLIENT_API_KEY check to /api/client/status endpoint
- [x] OR return minimal info only (status yes/no, no metadata)

### 7. No Email Verification
**Files**: `/api/register`, `/api/admin/clients/[id]`
**Risk**: An admin could steal someone's email by editing client record or registering with victim's email.
**Fix**: Add email verification flow with time-limited tokens
- [ ] Create email verification token system
- [ ] Add verification step to registration
- [ ] Validate email changes in admin client updates

---

## 🟡 MEDIUM Priority Issues

### 8. Open Client API Without CLIENT_API_KEY Env
**Files**: `/api/client/validate`, `/api/client/activate`
**Risk**: If `CLIENT_API_KEY` env var is unset, the API is completely open.
**Fix**: Make the key required in production or fail loudly
- [x] Make CLIENT_API_KEY required (remove silent fallback)
- [x] Add startup warning if not set in production

### 9. No Validation of Negative maxSeats
**File**: `src/app/api/admin/licenses/[id]/route.ts:40`
**Risk**: Admin can PATCH license with `maxSeats: -5`, breaking seat logic.
**Fix**: Validate `maxSeats >= 1` before update
- [x] Add validation: `maxSeats < 1 → 400 error`

### 10. Subscription Status Transitions Not Validated
**Files**: Subscription update endpoints
**Risk**: Admin could directly set invalid transitions like `ACTIVE → TRIAL` or `SUSPENDED → CANCELLED`.
**Fix**: Implement state machine with whitelisted transitions
- [x] Define allowed transitions per status
- [x] Validate transitions before update
- [x] Examples: PENDING_PAYMENT → ACTIVE, ACTIVE → SUSPENDED, SUSPENDED → ACTIVE only

### 11. Invoice Status Not Fully Validated
**File**: `src/app/api/admin/invoices/[id]/send-payment/route.ts:26`
**Risk**: Only checks PAID status. Should reject OVERDUE, WAIVED, or CANCELLED invoices.
**Fix**: Add checks for all invalid statuses
- [x] Reject OVERDUE invoices from being re-paid
- [x] Reject WAIVED invoices
- [x] Reject CANCELLED invoices

### 12. Fragile Middleware Route Exclusions
**File**: `src/middleware.ts:35-39`
**Risk**: Client API route exclusion uses pattern matching. If new routes are added, they might not match exclusion patterns and cause issues.
```typescript
!pathname.startsWith('/api/client/auth') &&
!pathname.startsWith('/api/client/validate') &&
```
**Fix**: Use allowlist instead of exclusion list
- [x] Refactor to allowlist of protected routes (`PUBLIC_CLIENT_PATHS` constant)
- [x] OR centralize route protection configuration

### 13. parseInt() Without Validation
**Files**: `/api/admin/licenses/route.ts:55`, `/api/admin/licenses/[id]/route.ts:40`
**Risk**: `parseInt("not-a-number")` returns `NaN`
```typescript
maxSeats: parseInt(maxSeats)  // NaN if invalid
```
**Fix**: Validate before parsing or use safer conversion
- [x] Validate input is numeric string before parseInt
- [x] Use Number.isInteger() after conversion

---

## 🔵 LOWER Priority / Design Issues

### 14. No CSRF Protection
**Files**: All POST/PATCH/DELETE endpoints
**Risk**: Cross-site request forgery on form submissions (mitigated by httpOnly cookies but still a concern).
**Fix**: Validate Referer header or add CSRF tokens
- [x] Add Origin/Referer header validation on admin mutations (`src/lib/csrf.ts`)
- [x] Applied in middleware for all admin POST/PATCH/PUT/DELETE requests

### 15. Implicit Client Authorization
**Files**: `/api/client/*` routes
**Risk**: Routes trust `x-client-id` header from middleware. If middleware is bypassed, entire client API is compromised.
**Fix**: Add defensive checks in route handlers
- [x] Validate CUID format of `x-client-id` via `getClientId()` before trusting it (`src/lib/client-auth.ts`)
- [x] Applied to all client subscription route handlers

### 16. No Input Sanitization on Notes Fields
**Status**: ✅ CLOSED — All notes render as plain JSX `{value}` expressions.
React escapes these values automatically. No raw HTML injection is used near
user-generated content. No code changes required.
- [x] Verify frontend escapes license.notes
- [x] Verify frontend escapes internalNotes
- [x] Verify frontend escapes clientNotes

---

## Summary

| Issue | Severity | Impact | Status |
|-------|----------|--------|--------|
| Default JWT secret | CRITICAL | Token forgery | [x] |
| Unhandled JSON errors | CRITICAL | 500 errors, DoS | [x] |
| Type coercion in seats | CRITICAL | Invalid DB data | [x] |
| Activation race condition | HIGH | Constraint violation | [x] |
| No rate limiting | HIGH | Brute force attacks | [x] |
| License key enumeration | HIGH | Information disclosure | [x] |
| No email verification | HIGH | Email takeover | [ ] |
| Open client API | MEDIUM | Unauthorized access | [x] |
| Invalid seat values | MEDIUM | Data corruption | [x] |
| Status transitions | MEDIUM | Invalid states | [x] |
| Invoice validation | MEDIUM | Double payment | [x] |
| Middleware fragility | MEDIUM | Auth bypass risk | [x] |
| parseInt bugs | MEDIUM | NaN in DB | [x] |
| CSRF protection | LOW | Form hijacking | [x] |
| Implicit auth | LOW | Defense in depth | [x] |
| XSS in notes | LOW | UI injection | [x] |

---

## Implementation Status

### ✅ Completed (2026-04-08)

**CRITICAL (3/3):**
- [x] #1: Remove JWT secret fallback — throws if JWT_SECRET unset
- [x] #2: Guard all req.json() calls in 9 routes with parseBody() utility
- [x] #3: Strict type validation on seats (number + integer check)

**HIGH (3/3):**
- [x] #4: Wrap activation in DB transaction to fix TOCTOU race
- [x] #5: In-memory rate limiter on both login endpoints (5 req / 15 min per IP)
- [x] #6: Minimize license status endpoint — return `{ active: bool }` only

**MEDIUM (5/8):**
- [x] #8: Validate maxSeats >= 1 in admin/licenses PATCH
- [x] #9: Guard parseInt() against NaN in both license routes
- [x] #10: Reject OVERDUE/WAIVED/CANCELLED invoices from send-payment
- [x] #7: Require CLIENT_API_KEY in production for validate/activate endpoints
- [x] #13: Strict type validation + NaN guards for seat counts

**Testing Added (Phase 1):**
- New test suite: `vitest` with 3 test files (auth, api, rate-limit)
- 9 tests total, all passing

### ✅ Completed (2026-04-08) — Phase 2

**MEDIUM (3/3):**
- [x] #11: Subscription status transition allowlist — `src/lib/transitions.ts`, applied to admin PATCH handler
- [x] #12: Middleware `PUBLIC_CLIENT_PATHS` constant — replaces fragile exclusion chain
- [x] Bonus: `billing-date/route.ts` bare `req.json()` fixed with `parseBody`

**LOW (3/3):**
- [x] #14: CSRF protection — `src/lib/csrf.ts` Origin/Referer check applied in middleware for admin mutations
- [x] #15: Client-ID CUID format validation — `src/lib/client-auth.ts` `getClientId()` applied to subscription routes
- [x] #16: XSS in notes fields — CLOSED, React JSX escaping already handles this, no code changes needed

**Testing Added (Phase 2):**
- 3 new test files: transitions, csrf, client-auth
- 21 new tests; 30 total across 6 test files, all passing

### ⏸️ Deferred

**HIGH (1):**
- [ ] #7: Email verification flow — requires email service + token system (separate plan, pending email provider decision)
