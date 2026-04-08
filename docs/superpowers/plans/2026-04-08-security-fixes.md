# Security Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all CRITICAL and HIGH security issues from `SECURITY_AUDIT.md`, plus MEDIUM issues that are simple code-level fixes.

**Architecture:** Fixes span `src/lib/auth.ts`, `src/middleware.ts`, nine API route handlers, and two new utilities (`src/lib/api.ts` for JSON parsing, `src/lib/rate-limit.ts` for in-memory rate limiting). No new dependencies except `vitest` for testing.

**Tech Stack:** Next.js 14 App Router, Prisma 5, `jose` (JWT), TypeScript, Vitest

---

## Scope

Issues addressed (from `SECURITY_AUDIT.md`):

| # | Severity | Issue |
|---|----------|-------|
| 1 | CRITICAL | Default JWT secret fallback |
| 2 | CRITICAL | Unhandled JSON parse errors (9 routes) |
| 3 | CRITICAL | Seat type coercion in subscription |
| 4 | HIGH | Activation race condition (TOCTOU on seat count) |
| 5 | HIGH | No rate limiting on login endpoints |
| 6 | HIGH | License key enumeration via status endpoint |
| 7 | MEDIUM | Open client API without CLIENT_API_KEY |
| 8 | MEDIUM | Negative/invalid maxSeats in admin license PATCH |
| 9 | MEDIUM | parseInt() without NaN guard |
| 10 | MEDIUM | Invoice status not fully validated |

**Not in this plan** (separate feature work): email verification (#7 HIGH), subscription status transitions, middleware allowlist refactor, CSRF, XSS note escaping.

---

## Files Modified / Created

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/auth.ts` | Modify | Remove JWT secret fallback; export `getJwtSecret()` |
| `src/middleware.ts` | Modify | Import `getJwtSecret()` from auth.ts; remove duplicate fallback |
| `src/lib/api.ts` | **Create** | `parseBody()` utility — wraps `req.json()` in try-catch |
| `src/lib/rate-limit.ts` | **Create** | In-memory rate limiter (5 attempts / 15 min per IP) |
| `src/app/api/client/validate/route.ts` | Modify | Wrap `req.json()` via `parseBody()` |
| `src/app/api/client/activate/route.ts` | Modify | `parseBody()`; transaction for seat race; require `CLIENT_API_KEY` |
| `src/app/api/client/subscription/route.ts` | Modify | `parseBody()`; strict seat type validation |
| `src/app/api/client/auth/login/route.ts` | Modify | `parseBody()`; apply rate limiter |
| `src/app/api/client/status/[key]/route.ts` | Modify | Return minimal response (status only, no metadata) |
| `src/app/api/admin/licenses/route.ts` | Modify | `parseBody()`; parseInt validation |
| `src/app/api/admin/licenses/[id]/route.ts` | Modify | `parseBody()`; parseInt + maxSeats validation |
| `src/app/api/admin/clients/route.ts` | Modify | `parseBody()` |
| `src/app/api/admin/clients/[id]/route.ts` | Modify | `parseBody()` |
| `src/app/api/register/route.ts` | Modify | `parseBody()` |
| `src/app/api/auth/login/route.ts` | Modify | Apply rate limiter (already has try-catch) |
| `src/app/api/admin/invoices/[id]/send-payment/route.ts` | Modify | Reject OVERDUE/WAIVED/CANCELLED invoices |
| `vitest.config.ts` | **Create** | Vitest config for Next.js edge/node routes |
| `src/lib/__tests__/auth.test.ts` | **Create** | Tests for JWT secret guard |
| `src/lib/__tests__/api.test.ts` | **Create** | Tests for parseBody() |
| `src/lib/__tests__/rate-limit.test.ts` | **Create** | Tests for rate limiter |
| `src/app/api/__tests__/security.test.ts` | **Create** | Integration-style tests for key security paths |

---

## Task 0: Install Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install vitest**

```bash
cd /Users/victoria/Desktop/TurbowareV2
npm install --save-dev vitest @vitest/coverage-v8
```

Expected: vitest appears in `devDependencies` in `package.json`.

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Add test script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify vitest runs**

```bash
npx vitest run --reporter=verbose 2>&1 | head -20
```

Expected: output like `No test files found` or vitest starts without errors.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest test runner"
```

---

## Task 1: Fix JWT Secret (CRITICAL #1)

**Files:**
- Modify: `src/lib/auth.ts:4-5`
- Modify: `src/middleware.ts:5-6`
- Create: `src/lib/__tests__/auth.test.ts`

**Context:** Both `auth.ts` and `middleware.ts` define an identical `secret()` closure with a `|| 'dev-secret-change-me'` fallback. If `JWT_SECRET` env var is absent in production, any attacker can forge tokens using the known default. Fix: consolidate into one exported function that throws if the env var is missing.

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/auth.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('getJwtSecret', () => {
  const original = process.env.JWT_SECRET

  afterEach(() => {
    if (original === undefined) delete process.env.JWT_SECRET
    else process.env.JWT_SECRET = original
  })

  it('returns encoded secret when JWT_SECRET is set', async () => {
    process.env.JWT_SECRET = 'test-secret-value'
    const { getJwtSecret } = await import('../auth')
    const result = getJwtSecret()
    expect(result).toBeInstanceOf(Uint8Array)
  })

  it('throws when JWT_SECRET is not set', async () => {
    delete process.env.JWT_SECRET
    vi.resetModules()
    const { getJwtSecret } = await import('../auth')
    expect(() => getJwtSecret()).toThrow('JWT_SECRET environment variable is not set')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/auth.test.ts --reporter=verbose
```

Expected: FAIL — `getJwtSecret is not a function` or import error.

- [ ] **Step 3: Update auth.ts**

Replace lines 4-5 in `src/lib/auth.ts`:

**Before:**
```typescript
const secret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me')
```

**After:**
```typescript
export function getJwtSecret(): Uint8Array {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET environment variable is not set')
  return new TextEncoder().encode(s)
}
```

Then replace all 4 internal usages of `secret()` in `auth.ts` with `getJwtSecret()`:
- Line 25: `.sign(secret())` → `.sign(getJwtSecret())`
- Line 30: `jwtVerify(token, secret())` → `jwtVerify(token, getJwtSecret())`
- Line 44: `.sign(secret())` → `.sign(getJwtSecret())`
- Line 50: `jwtVerify(token, secret())` → `jwtVerify(token, getJwtSecret())`

- [ ] **Step 4: Update middleware.ts**

In `src/middleware.ts`:
1. Add import at top: `import { getJwtSecret } from '@/lib/auth'`
2. Delete lines 5-6 (the duplicate `const secret = ...` closure)
3. Replace all `secret()` usages in the file with `getJwtSecret()`:
   - Line 22: `jwtVerify(token, secret())` → `jwtVerify(token, getJwtSecret())`
   - Line 47: `jwtVerify(token, secret())` → `jwtVerify(token, getJwtSecret())`

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run src/lib/__tests__/auth.test.ts --reporter=verbose
```

Expected: PASS — both tests green.

- [ ] **Step 6: Verify build still compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/auth.ts src/middleware.ts src/lib/__tests__/auth.test.ts
git commit -m "fix(security): remove JWT secret fallback — fail loudly when JWT_SECRET unset"
```

---

## Task 2: parseBody() Utility for JSON Errors (CRITICAL #2)

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/lib/__tests__/api.test.ts`

**Context:** Nine route handlers call `await req.json()` without try-catch. Malformed JSON throws a `SyntaxError` that becomes an unhandled 500. Fix: create a shared `parseBody()` utility that returns `{ body, error }`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/api.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { parseBody } from '../api'
import { NextRequest } from 'next/server'

function makeRequest(body: string, contentType = 'application/json') {
  return new NextRequest('http://localhost/api/test', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  })
}

describe('parseBody', () => {
  it('returns parsed body for valid JSON', async () => {
    const req = makeRequest(JSON.stringify({ key: 'abc', seats: 5 }))
    const { body, error } = await parseBody(req)
    expect(error).toBeNull()
    expect(body).toEqual({ key: 'abc', seats: 5 })
  })

  it('returns error for malformed JSON', async () => {
    const req = makeRequest('{ invalid json }')
    const { body, error } = await parseBody(req)
    expect(body).toBeNull()
    expect(error).toBeInstanceOf(Error)
  })

  it('returns error for empty body', async () => {
    const req = makeRequest('')
    const { body, error } = await parseBody(req)
    expect(body).toBeNull()
    expect(error).toBeInstanceOf(Error)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/api.test.ts --reporter=verbose
```

Expected: FAIL — `parseBody is not a function`.

- [ ] **Step 3: Create src/lib/api.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'

type ParseResult<T> =
  | { body: T; error: null }
  | { body: null; error: Error }

/**
 * Safely parses the JSON body of a Next.js request.
 * Returns { body, error: null } on success or { body: null, error } on failure.
 * Use this instead of bare `await req.json()` to avoid unhandled 500s.
 */
export async function parseBody<T = Record<string, unknown>>(
  req: NextRequest,
): Promise<ParseResult<T>> {
  try {
    const body = await req.json() as T
    return { body, error: null }
  } catch (err) {
    return { body: null, error: err instanceof Error ? err : new Error('Invalid JSON') }
  }
}

/** Convenience: return a 400 response for parse failures. */
export function badRequest(message = 'Invalid or missing request body'): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 })
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/lib/__tests__/api.test.ts --reporter=verbose
```

Expected: PASS — 3 tests green.

- [ ] **Step 5: Apply parseBody to all 9 routes**

For each file below, replace the bare `await req.json()` call. Pattern is the same for all — add the import and wrap the call.

**5a. `src/app/api/client/validate/route.ts` (line 19)**

Add import at top:
```typescript
import { parseBody, badRequest } from '@/lib/api'
```

Replace line 19:
```typescript
// Before
const { key, hardwareId } = await req.json()
// After
const { body, error } = await parseBody<{ key?: string; hardwareId?: string }>(req)
if (error) return badRequest()
const { key, hardwareId } = body
```

**5b. `src/app/api/client/activate/route.ts` (line 24)**

Add import at top:
```typescript
import { parseBody, badRequest } from '@/lib/api'
```

Replace line 24:
```typescript
// Before
const { key, hardwareId, label } = await req.json()
// After
const { body, error } = await parseBody<{ key?: string; hardwareId?: string; label?: string }>(req)
if (error) return badRequest()
const { key, hardwareId, label } = body
```

**5c. `src/app/api/client/subscription/route.ts` (line 60)**

Add import at top:
```typescript
import { parseBody, badRequest } from '@/lib/api'
```

Replace line 60:
```typescript
// Before
const { licenseKey, seats, billingDate } = await req.json()
// After
const { body, error } = await parseBody<{ licenseKey?: string; seats?: unknown; billingDate?: number }>(req)
if (error) return badRequest()
const { licenseKey, seats, billingDate } = body
```

**5d. `src/app/api/client/auth/login/route.ts` (line 7)**

Add import at top:
```typescript
import { parseBody, badRequest } from '@/lib/api'
```

Replace line 7:
```typescript
// Before
const { cnpj, password } = await req.json()
// After
const { body, error } = await parseBody<{ cnpj?: string; password?: string }>(req)
if (error) return badRequest()
const { cnpj, password } = body
```

**5e. `src/app/api/admin/licenses/route.ts` (line 41)**

Add import at top:
```typescript
import { parseBody, badRequest } from '@/lib/api'
```

Replace line 41:
```typescript
// Before
const body = await req.json()
const { product, notes, maxSeats, expiresAt, clientId } = body
// After
const { body: parsed, error } = await parseBody<{ product?: string; notes?: string; maxSeats?: unknown; expiresAt?: string; clientId?: string }>(req)
if (error) return badRequest()
const { product, notes, maxSeats, expiresAt, clientId } = parsed
```

**5f. `src/app/api/admin/licenses/[id]/route.ts` (line 13-14)**

Add import at top:
```typescript
import { parseBody, badRequest } from '@/lib/api'
```

Replace lines 13-14:
```typescript
// Before
const body = await req.json()
const { status, notes, maxSeats, expiresAt, product, clientId } = body
// After
const { body: parsed, error } = await parseBody<{ status?: string; notes?: string; maxSeats?: unknown; expiresAt?: string; product?: string; clientId?: string }>(req)
if (error) return badRequest()
const { status, notes, maxSeats, expiresAt, product, clientId } = parsed
```

**5g. `src/app/api/admin/clients/route.ts` (line 29)**

Add import at top:
```typescript
import { parseBody, badRequest } from '@/lib/api'
```

Replace line 29:
```typescript
// Before
const body = await req.json()
const { name, email, phone, company, internalNotes } = body
// After
const { body: parsed, error } = await parseBody<{ name?: string; email?: string; phone?: string; company?: string; internalNotes?: string }>(req)
if (error) return badRequest()
const { name, email, phone, company, internalNotes } = parsed
```

**5h. `src/app/api/admin/clients/[id]/route.ts` (line 29)**

Add import at top:
```typescript
import { parseBody, badRequest } from '@/lib/api'
```

Replace line 29:
```typescript
// Before
const body = await req.json()
const { name, email, phone, company, cnpj, internalNotes, newPassword } = body
// After
const { body: parsed, error } = await parseBody<{ name?: string; email?: string; phone?: string; company?: string; cnpj?: string; internalNotes?: string; newPassword?: string }>(req)
if (error) return badRequest()
const { name, email, phone, company, cnpj, internalNotes, newPassword } = parsed
```

**5i. `src/app/api/register/route.ts` (line 13)**

Add import at top:
```typescript
import { parseBody, badRequest } from '@/lib/api'
```

Replace line 13 (the bare `await req.json()`):
```typescript
// Before
const body = await req.json()
const { firstName, lastName, ... } = body
// After
const { body: parsed, error } = await parseBody(req)
if (error) return badRequest()
const { firstName, lastName, cpf, phone, cnpj, tradeName, legalName,
        openingDate, fullAddress, financialEmail, technicalEmail,
        ddns, ddnsUsername, ddnsPassword, password, product,
        message, internalNotes, recaptchaToken, acceptedTerms } = parsed as Record<string, string>
```

- [ ] **Step 6: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: No new TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/api.ts src/lib/__tests__/api.test.ts \
  src/app/api/client/validate/route.ts \
  src/app/api/client/activate/route.ts \
  src/app/api/client/subscription/route.ts \
  src/app/api/client/auth/login/route.ts \
  src/app/api/admin/licenses/route.ts \
  "src/app/api/admin/licenses/[id]/route.ts" \
  src/app/api/admin/clients/route.ts \
  "src/app/api/admin/clients/[id]/route.ts" \
  src/app/api/register/route.ts
git commit -m "fix(security): guard all req.json() calls against malformed body (CRITICAL #2)"
```

---

## Task 3: Seat Type Validation + parseInt Guards (CRITICAL #3, MEDIUM #9, #13)

**Files:**
- Modify: `src/app/api/client/subscription/route.ts:64`
- Modify: `src/app/api/admin/licenses/route.ts:55`
- Modify: `src/app/api/admin/licenses/[id]/route.ts:40`

**Context:** `seats` in the subscription route accepts `"abc"` (NaN after arithmetic). `parseInt()` in two admin license routes can silently produce NaN. Fix both with strict type checks before any arithmetic.

- [ ] **Step 1: Fix seat validation in subscription/route.ts**

Find the seat validation block (around line 64 after the parseBody change from Task 2):

```typescript
// Before
if (!seats || seats < 1)
  return NextResponse.json({ error: 'Seat count is required.' }, { status: 400 })
```

Replace with:
```typescript
if (typeof seats !== 'number' || !Number.isInteger(seats) || seats < 1)
  return NextResponse.json({ error: 'Seat count must be a positive integer.' }, { status: 400 })
```

- [ ] **Step 2: Fix parseInt in admin/licenses/route.ts**

Find the `maxSeats: parseInt(maxSeats)` line (around line 55). Replace the relevant block:

```typescript
// Before
maxSeats: parseInt(maxSeats)
```

```typescript
// After — validate before parsing
const parsedMaxSeats = parseInt(String(maxSeats), 10)
if (!maxSeats || isNaN(parsedMaxSeats) || parsedMaxSeats < 1)
  return NextResponse.json({ error: 'maxSeats must be a positive integer.' }, { status: 400 })
```

Then use `parsedMaxSeats` in the Prisma call:
```typescript
maxSeats: parsedMaxSeats
```

- [ ] **Step 3: Fix parseInt + maxSeats validation in admin/licenses/[id]/route.ts**

Find the `maxSeats: parseInt(maxSeats)` line (around line 40). Replace:

```typescript
// Before
maxSeats: parseInt(maxSeats)
```

```typescript
// After
if (maxSeats !== undefined) {
  const parsedMaxSeats = parseInt(String(maxSeats), 10)
  if (isNaN(parsedMaxSeats) || parsedMaxSeats < 1)
    return NextResponse.json({ error: 'maxSeats must be a positive integer.' }, { status: 400 })
  updateData.maxSeats = parsedMaxSeats
}
```

Note: adjust to match how `updateData` is being built in that file. The key check is `isNaN(parsedMaxSeats) || parsedMaxSeats < 1`.

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/client/subscription/route.ts \
  src/app/api/admin/licenses/route.ts \
  "src/app/api/admin/licenses/[id]/route.ts"
git commit -m "fix(security): strict seat/maxSeats type validation; guard parseInt against NaN"
```

---

## Task 4: Activation Race Condition (HIGH #4)

**Files:**
- Modify: `src/app/api/client/activate/route.ts:42-73`

**Context:** The activation flow reads all activations, checks count in memory, then inserts — a classic TOCTOU race. Two concurrent requests with different `hardwareId`s could both pass the `maxSeats` check and both insert. Fix: wrap the count-check and insert in a `$transaction`. The existing `@@unique([licenseId, hardwareId])` constraint already protects against duplicate-hardware races.

- [ ] **Step 1: Wrap activation in a transaction**

Replace the section from the `const existing = ...` check through `prisma.activation.create(...)` (lines ~42–73 in the original, now shifted slightly by Task 2):

```typescript
// Replace this block:
// const existing = license.activations.find(...)
// if (existing) { ... update ... return }
// const { ok, reason } = isLicenseUsable(...)
// if (!ok) { ... return }
// await prisma.activation.create(...)
// return NextResponse.json({ success: true, ... })

// With this transactional version:
const result = await prisma.$transaction(async (tx) => {
  // Re-fetch inside transaction to get consistent activation count
  const freshLicense = await tx.license.findUnique({
    where: { key },
    include: { activations: true },
  })

  if (!freshLicense) return { type: 'not_found' as const }

  const existing = freshLicense.activations.find((a) => a.hardwareId === hardwareId)
  if (existing) {
    await tx.activation.update({
      where: { id: existing.id },
      data: { lastSeenAt: new Date(), ...(label ? { label } : {}) },
    })
    return { type: 'already_activated' as const }
  }

  const { ok, reason } = isLicenseUsable(
    freshLicense.status,
    freshLicense.expiresAt,
    freshLicense.activations.length,
    freshLicense.maxSeats,
  )
  if (!ok) return { type: 'not_usable' as const, reason }

  await tx.activation.create({
    data: { licenseId: freshLicense.id, hardwareId, label: label || null },
  })
  return { type: 'activated' as const }
})

if (result.type === 'not_found')
  return NextResponse.json({ success: false, message: 'License key not found.' }, { status: 404 })
if (result.type === 'not_usable')
  return NextResponse.json({ success: false, message: result.reason })
if (result.type === 'already_activated')
  return NextResponse.json({ success: true, message: 'Already activated on this device.', alreadyActivated: true })

return NextResponse.json({ success: true, message: 'License activated successfully.', alreadyActivated: false })
```

Also remove the now-redundant initial `prisma.license.findUnique` at lines 33-36 (the one that fetches before the transaction) since the transaction does its own fresh fetch.

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/client/activate/route.ts
git commit -m "fix(security): wrap activation seat-count check in DB transaction to prevent TOCTOU race"
```

---

## Task 5: Rate Limiting on Login Endpoints (HIGH #5)

**Files:**
- Create: `src/lib/rate-limit.ts`
- Create: `src/lib/__tests__/rate-limit.test.ts`
- Modify: `src/app/api/auth/login/route.ts`
- Modify: `src/app/api/client/auth/login/route.ts`

**Context:** Both login endpoints have no brute-force protection. Add an in-memory rate limiter: 5 attempts per 15 minutes per IP. This is per-process (not cross-replica), acceptable for this deployment scale. Note: For multi-instance deployments, upgrade to Redis-backed rate limiting.

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/rate-limit.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Date to control time
describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests below limit', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const { RateLimiter } = await import('../rate-limit')
    const limiter = new RateLimiter({ max: 5, windowMs: 15 * 60 * 1000 })

    for (let i = 0; i < 5; i++) {
      expect(limiter.check('1.2.3.4')).toBe(true)
    }
  })

  it('blocks requests over limit', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    vi.resetModules()
    const { RateLimiter } = await import('../rate-limit')
    const limiter = new RateLimiter({ max: 5, windowMs: 15 * 60 * 1000 })

    for (let i = 0; i < 5; i++) limiter.check('1.2.3.4')
    expect(limiter.check('1.2.3.4')).toBe(false)
  })

  it('resets after window expires', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    vi.resetModules()
    const { RateLimiter } = await import('../rate-limit')
    const limiter = new RateLimiter({ max: 5, windowMs: 15 * 60 * 1000 })

    for (let i = 0; i < 5; i++) limiter.check('1.2.3.4')

    // Advance 16 minutes
    vi.advanceTimersByTime(16 * 60 * 1000)
    expect(limiter.check('1.2.3.4')).toBe(true)
  })

  it('does not affect other IPs', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    vi.resetModules()
    const { RateLimiter } = await import('../rate-limit')
    const limiter = new RateLimiter({ max: 5, windowMs: 15 * 60 * 1000 })

    for (let i = 0; i < 6; i++) limiter.check('1.2.3.4')
    expect(limiter.check('9.9.9.9')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/rate-limit.test.ts --reporter=verbose
```

Expected: FAIL — `RateLimiter is not a constructor`.

- [ ] **Step 3: Create src/lib/rate-limit.ts**

```typescript
interface RateLimiterOptions {
  max: number       // max requests per window
  windowMs: number  // window size in ms
}

interface Entry {
  count: number
  resetAt: number
}

export class RateLimiter {
  private store = new Map<string, Entry>()
  private max: number
  private windowMs: number

  constructor({ max, windowMs }: RateLimiterOptions) {
    this.max = max
    this.windowMs = windowMs
  }

  /** Returns true if the request is allowed, false if rate-limited. */
  check(ip: string): boolean {
    const now = Date.now()
    const entry = this.store.get(ip)

    if (!entry || now >= entry.resetAt) {
      this.store.set(ip, { count: 1, resetAt: now + this.windowMs })
      return true
    }

    if (entry.count >= this.max) return false

    entry.count++
    return true
  }
}

/** Shared instance for login endpoints: 5 attempts per 15 minutes per IP. */
export const loginRateLimiter = new RateLimiter({ max: 5, windowMs: 15 * 60 * 1000 })
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/lib/__tests__/rate-limit.test.ts --reporter=verbose
```

Expected: PASS — 4 tests green.

- [ ] **Step 5: Apply rate limiter to admin login — src/app/api/auth/login/route.ts**

Add import at the top:
```typescript
import { loginRateLimiter } from '@/lib/rate-limit'
```

Inside the `POST` handler, before the existing `try {` block, add:

```typescript
const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
if (!loginRateLimiter.check(ip)) {
  return NextResponse.json(
    { error: 'Too many login attempts. Please try again in 15 minutes.' },
    { status: 429 },
  )
}
```

- [ ] **Step 6: Apply rate limiter to client login — src/app/api/client/auth/login/route.ts**

Add import at the top:
```typescript
import { loginRateLimiter } from '@/lib/rate-limit'
```

After the `parseBody` call (added in Task 2) and before the first DB query, add:

```typescript
const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
if (!loginRateLimiter.check(ip)) {
  return NextResponse.json(
    { error: 'Too many login attempts. Please try again in 15 minutes.' },
    { status: 429 },
  )
}
```

- [ ] **Step 7: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git add src/lib/rate-limit.ts src/lib/__tests__/rate-limit.test.ts \
  src/app/api/auth/login/route.ts \
  src/app/api/client/auth/login/route.ts
git commit -m "fix(security): add in-memory rate limiting to login endpoints (5 req / 15 min per IP)"
```

---

## Task 6: Minimize License Status Endpoint (HIGH #6)

**Files:**
- Modify: `src/app/api/client/status/[key]/route.ts`

**Context:** The public `GET /api/client/status/[key]` endpoint returns full license metadata (product, expiresAt, maxSeats, activatedSeats, createdAt) to anyone with a key. This enables enumeration of key metadata. Fix: return only the effective status (active/inactive boolean), nothing else.

- [ ] **Step 1: Update the status endpoint**

Replace the entire `GET` handler body in `src/app/api/client/status/[key]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveStatus } from '@/lib/license'

type Params = { params: { key: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const license = await prisma.license.findUnique({
    where: { key: params.key },
    select: { status: true, expiresAt: true },
  })

  if (!license) {
    // Return same shape for not-found to avoid key existence oracle
    return NextResponse.json({ active: false })
  }

  const effectiveStatus = resolveStatus(license.status, license.expiresAt)
  return NextResponse.json({ active: effectiveStatus === 'ACTIVE' })
}
```

Key changes:
- Returns only `{ active: boolean }` — no product, no expiry date, no seat counts
- Returns `{ active: false }` for unknown keys (same shape, avoids key existence oracle)
- Uses `select` to avoid fetching unneeded fields

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/client/status/[key]/route.ts
git commit -m "fix(security): minimize license status endpoint response — return active bool only"
```

---

## Task 7: Require CLIENT_API_KEY in Production (MEDIUM #7, #8)

**Files:**
- Modify: `src/app/api/client/validate/route.ts`
- Modify: `src/app/api/client/activate/route.ts`

**Context:** Both endpoints skip the `CLIENT_API_KEY` check if the env var is not set. In production with no key configured, the entire client API is open. Fix: keep backward compat for dev (`NODE_ENV !== 'production'`), but fail loudly in production.

- [ ] **Step 1: Update validate/route.ts**

Replace the `CLIENT_API_KEY` check block at the top of the `POST` handler:

```typescript
// Before
const clientApiKey = process.env.CLIENT_API_KEY
if (clientApiKey) {
  const auth = req.headers.get('authorization')
  if (!auth || auth !== `Bearer ${clientApiKey}`) {
    return NextResponse.json({ valid: false, message: 'Unauthorized' }, { status: 401 })
  }
}
```

```typescript
// After
const clientApiKey = process.env.CLIENT_API_KEY
if (!clientApiKey && process.env.NODE_ENV === 'production') {
  console.error('[validate] CLIENT_API_KEY is not set in production')
  return NextResponse.json({ valid: false, message: 'Service misconfigured' }, { status: 503 })
}
if (clientApiKey) {
  const auth = req.headers.get('authorization')
  if (!auth || auth !== `Bearer ${clientApiKey}`) {
    return NextResponse.json({ valid: false, message: 'Unauthorized' }, { status: 401 })
  }
}
```

- [ ] **Step 2: Apply same pattern to activate/route.ts**

Replace the `CLIENT_API_KEY` check block at the top of the `POST` handler:

```typescript
// Before
const clientApiKey = process.env.CLIENT_API_KEY
if (clientApiKey) {
  const auth = req.headers.get('authorization')
  if (!auth || auth !== `Bearer ${clientApiKey}`) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
}
```

```typescript
// After
const clientApiKey = process.env.CLIENT_API_KEY
if (!clientApiKey && process.env.NODE_ENV === 'production') {
  console.error('[activate] CLIENT_API_KEY is not set in production')
  return NextResponse.json({ success: false, message: 'Service misconfigured' }, { status: 503 })
}
if (clientApiKey) {
  const auth = req.headers.get('authorization')
  if (!auth || auth !== `Bearer ${clientApiKey}`) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/client/validate/route.ts src/app/api/client/activate/route.ts
git commit -m "fix(security): require CLIENT_API_KEY in production for validate/activate endpoints"
```

---

## Task 8: Invoice Status Validation (MEDIUM #10, #11)

**Files:**
- Modify: `src/app/api/admin/invoices/[id]/send-payment/route.ts:26`

**Context:** The send-payment endpoint only rejects `PAID` invoices. `OVERDUE`, `WAIVED`, and `CANCELLED` invoices should also be rejected.

- [ ] **Step 1: Update invoice status check**

Replace lines 26-28 in `src/app/api/admin/invoices/[id]/send-payment/route.ts`:

```typescript
// Before
if (invoice.status === 'PAID') {
  return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 })
}
```

```typescript
// After
const nonPayableStatuses = ['PAID', 'WAIVED', 'CANCELLED', 'OVERDUE'] as const
if (nonPayableStatuses.includes(invoice.status as typeof nonPayableStatuses[number])) {
  return NextResponse.json(
    { error: `Invoice cannot be paid — current status: ${invoice.status}` },
    { status: 400 },
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors. If there's a type error on `invoice.status`, check the Prisma-generated type for `InvoiceStatus` enum and adjust the cast accordingly.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/admin/invoices/[id]/send-payment/route.ts"
git commit -m "fix(security): reject OVERDUE/WAIVED/CANCELLED invoices from send-payment endpoint"
```

---

## Task 9: Run All Tests + Final Build Check

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run --reporter=verbose
```

Expected: All tests pass (auth, api, rate-limit test files).

- [ ] **Step 2: TypeScript compile check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Update SECURITY_AUDIT.md checkboxes**

Mark all addressed items as complete in `SECURITY_AUDIT.md`. For each resolved issue, change `[ ]` to `[x]` in both the issue checklist and the summary table.

Issues to mark complete: #1, #2, #3, #4, #5, #6, #7 (partial — CLIENT_API_KEY), #8, #9, #11, #13.

- [ ] **Step 4: Commit audit file**

```bash
git add SECURITY_AUDIT.md
git commit -m "docs: update SECURITY_AUDIT.md — mark resolved issues complete"
```

---

## Verification

To manually verify key fixes after implementation:

**JWT Secret guard:**
```bash
# Unset JWT_SECRET and start the dev server — should see startup error or 500 on first auth call
JWT_SECRET= npx next dev
```

**JSON parse error (400 not 500):**
```bash
curl -s -X POST http://localhost:3000/api/client/validate \
  -H "Content-Type: application/json" \
  -d "not-json" | jq .
# Expected: { "error": "Invalid or missing request body" } with HTTP 400
```

**Rate limiting:**
```bash
for i in {1..6}; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"x@x.com","password":"wrong"}'
done
# Expected: 5x 401, then 1x 429
```

**License status minimal response:**
```bash
curl -s http://localhost:3000/api/client/status/SOME-LICENSE-KEY | jq .
# Expected: { "active": true } or { "active": false } — no product/seats/dates
```
