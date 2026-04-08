# Backend Security Hardening — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve remaining MEDIUM/LOW backend security issues: subscription status transition validation, middleware public-route constant refactor, CSRF origin check, and defensive client-ID validation.

**Architecture:** Four independent fixes: (1) a transition allowlist in the admin subscription PATCH handler, (2) a named constant replacing the middleware exclusion chain, (3) a `csrf.ts` utility applied in middleware for admin mutations, (4) a `getClientId()` helper with CUID format validation replacing bare header reads. Each fix is self-contained with its own tests.

**Tech Stack:** Next.js 14 App Router, Prisma 5 (`SubscriptionStatus` enum), TypeScript strict, vitest, existing `parseBody`/`badRequest` utilities in `src/lib/api.ts`

---

## Issues Addressed

| # | Severity | Issue |
|---|----------|-------|
| 11 | MEDIUM | Subscription status transitions not validated |
| 12 | MEDIUM | Fragile middleware route exclusions |
| 14 | LOW | No CSRF protection |
| 15 | LOW | Implicit client auth trust |
| 16 | LOW | **CLOSED** — XSS in notes already safe (all notes render as plain JSX `{value}` — React escapes automatically; no raw HTML injection exists near user data) |

**Bonus:** `billing-date/route.ts` also has a bare `req.json()` — fixed in Task 1.

---

## Files Modified / Created

| File | Action | Purpose |
|------|--------|---------|
| `src/app/api/admin/clients/[id]/subscription/route.ts` | Modify | Add parseBody + transition validation |
| `src/app/api/client/subscription/billing-date/route.ts` | Modify | Add parseBody (missed in Phase 1) |
| `src/middleware.ts` | Modify | Extract PUBLIC_CLIENT_PATHS constant; add CSRF check for admin mutations |
| `src/lib/csrf.ts` | **Create** | `isSameSiteRequest()` utility |
| `src/lib/transitions.ts` | **Create** | `isValidTransition()` + `ALLOWED_TRANSITIONS` map |
| `src/lib/client-auth.ts` | **Create** | `getClientId()` with CUID format validation |
| `src/app/api/client/subscription/grace/route.ts` | Modify | Use `getClientId()` |
| `src/app/api/client/subscription/route.ts` | Modify | Use `getClientId()` |
| `src/lib/__tests__/transitions.test.ts` | **Create** | Tests for transition validator |
| `src/lib/__tests__/csrf.test.ts` | **Create** | Tests for CSRF utility |
| `src/lib/__tests__/client-auth.test.ts` | **Create** | Tests for getClientId() |

---

## Task 1: Status Transition Validation + parseBody Cleanup (#11)

**Files:**
- Create: `src/lib/transitions.ts`
- Create: `src/lib/__tests__/transitions.test.ts`
- Modify: `src/app/api/admin/clients/[id]/subscription/route.ts`
- Modify: `src/app/api/client/subscription/billing-date/route.ts`

**Context:** The admin PATCH accepts any `status` string and writes it directly to Prisma. The `SubscriptionStatus` enum has 5 values: `TRIAL | PENDING_PAYMENT | ACTIVE | SUSPENDED | CANCELLED`. This task adds a transition allowlist and wraps the bare `req.json()` calls.

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/transitions.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { isValidTransition } from '../transitions'

describe('isValidTransition', () => {
  it('allows PENDING_PAYMENT → ACTIVE', () => {
    expect(isValidTransition('PENDING_PAYMENT', 'ACTIVE')).toBe(true)
  })

  it('allows ACTIVE → SUSPENDED', () => {
    expect(isValidTransition('ACTIVE', 'SUSPENDED')).toBe(true)
  })

  it('allows SUSPENDED → ACTIVE', () => {
    expect(isValidTransition('SUSPENDED', 'ACTIVE')).toBe(true)
  })

  it('allows any valid status → CANCELLED', () => {
    expect(isValidTransition('TRIAL', 'CANCELLED')).toBe(true)
    expect(isValidTransition('ACTIVE', 'CANCELLED')).toBe(true)
    expect(isValidTransition('SUSPENDED', 'CANCELLED')).toBe(true)
  })

  it('allows CANCELLED → PENDING_PAYMENT (reactivation)', () => {
    expect(isValidTransition('CANCELLED', 'PENDING_PAYMENT')).toBe(true)
  })

  it('blocks ACTIVE → TRIAL', () => {
    expect(isValidTransition('ACTIVE', 'TRIAL')).toBe(false)
  })

  it('blocks CANCELLED → ACTIVE (must go through PENDING_PAYMENT)', () => {
    expect(isValidTransition('CANCELLED', 'ACTIVE')).toBe(false)
  })

  it('blocks same-state transition', () => {
    expect(isValidTransition('ACTIVE', 'ACTIVE')).toBe(false)
  })

  it('blocks unknown status values', () => {
    expect(isValidTransition('ACTIVE', 'INVALID')).toBe(false)
    expect(isValidTransition('UNKNOWN', 'ACTIVE')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/transitions.test.ts --reporter=verbose 2>&1 | tail -10
```

Expected: FAIL — `isValidTransition is not a function`.

- [ ] **Step 3: Create src/lib/transitions.ts**

```typescript
import { SubscriptionStatus } from '@prisma/client'

export const ALLOWED_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  TRIAL:           ['PENDING_PAYMENT', 'CANCELLED'],
  PENDING_PAYMENT: ['ACTIVE', 'SUSPENDED', 'CANCELLED'],
  ACTIVE:          ['SUSPENDED', 'CANCELLED'],
  SUSPENDED:       ['ACTIVE', 'PENDING_PAYMENT', 'CANCELLED'],
  CANCELLED:       ['PENDING_PAYMENT'],
}

export function isValidTransition(from: string, to: string): boolean {
  const allowed = ALLOWED_TRANSITIONS[from as SubscriptionStatus]
  if (!allowed) return false
  return allowed.includes(to as SubscriptionStatus)
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/lib/__tests__/transitions.test.ts --reporter=verbose 2>&1 | tail -10
```

Expected: PASS — 9 tests green.

- [ ] **Step 5: Update admin subscription PATCH**

Full replacement for `src/app/api/admin/clients/[id]/subscription/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { isValidTransition } from '@/lib/transitions'
import { SubscriptionStatus } from '@prisma/client'

type Params = { params: { id: string } }

// GET /api/admin/clients/[id]/subscription
export async function GET(_req: NextRequest, { params }: Params) {
  const sub = await prisma.subscription.findUnique({
    where: { clientId: params.id },
    include: {
      invoices: { orderBy: { createdAt: 'desc' } },
      license:  { select: { key: true, status: true, maxSeats: true } },
    },
  })
  return NextResponse.json(sub ?? null)
}

// PATCH /api/admin/clients/[id]/subscription — update status manually
export async function PATCH(req: NextRequest, { params }: Params) {
  const { body, error } = await parseBody<{ status?: string }>(req)
  if (error) return badRequest()
  const { status } = body

  const validStatuses = Object.values(SubscriptionStatus)
  if (!status || !validStatuses.includes(status as SubscriptionStatus)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
      { status: 400 },
    )
  }

  const sub = await prisma.subscription.findUnique({ where: { clientId: params.id } })
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!isValidTransition(sub.status, status)) {
    return NextResponse.json(
      { error: `Invalid transition: ${sub.status} → ${status}` },
      { status: 400 },
    )
  }

  const updated = await prisma.subscription.update({
    where: { id: sub.id },
    data:  { status: status as SubscriptionStatus },
    include: {
      invoices: { orderBy: { createdAt: 'desc' } },
      license:  { select: { key: true, status: true, maxSeats: true } },
    },
  })
  return NextResponse.json(updated)
}
```

- [ ] **Step 6: Add parseBody to billing-date route**

In `src/app/api/client/subscription/billing-date/route.ts`:

Add import at top:
```typescript
import { parseBody, badRequest } from '@/lib/api'
```

Replace line 11 (`const { billingDate } = await req.json()`):
```typescript
const { body, error } = await parseBody<{ billingDate?: number }>(req)
if (error) return badRequest()
const { billingDate } = body
```

- [ ] **Step 7: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 8: Run all tests**

```bash
npx vitest run --reporter=verbose 2>&1 | tail -15
```

Expected: All existing + 9 new transitions tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/lib/transitions.ts src/lib/__tests__/transitions.test.ts \
  "src/app/api/admin/clients/[id]/subscription/route.ts" \
  src/app/api/client/subscription/billing-date/route.ts
git commit -m "fix(security): add subscription status transition validation with allowlist"
```

---

## Task 2: Middleware Public-Route Constant (#12)

**Files:**
- Modify: `src/middleware.ts`

**Context:** The exclusion chain `!pathname.startsWith('/api/client/auth') && ...` is fragile — adding a new public route requires expanding a four-line boolean expression. Replace with a named array so any future public route is one line.

- [ ] **Step 1: Update src/middleware.ts**

Find the `isClientApi` block and replace:

```typescript
// Before:
const isClientApi       = pathname.startsWith('/api/client/') &&
                          !pathname.startsWith('/api/client/auth') &&
                          !pathname.startsWith('/api/client/validate') &&
                          !pathname.startsWith('/api/client/activate') &&
                          !pathname.startsWith('/api/client/status')
```

```typescript
// After:
// Public client API routes — no JWT required.
// Add new public endpoints here; everything else under /api/client/ is protected.
const PUBLIC_CLIENT_PATHS = [
  '/api/client/auth',
  '/api/client/validate',
  '/api/client/activate',
  '/api/client/status',
]

const isClientApi = pathname.startsWith('/api/client/') &&
  !PUBLIC_CLIENT_PATHS.some((p) => pathname.startsWith(p))
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "refactor(security): extract PUBLIC_CLIENT_PATHS constant in middleware"
```

---

## Task 3: CSRF Origin Validation (#14)

**Files:**
- Create: `src/lib/csrf.ts`
- Create: `src/lib/__tests__/csrf.test.ts`
- Modify: `src/middleware.ts`

**Context:** Admin cookies use `sameSite: 'lax'` which prevents most CSRF. Adding an Origin/Referer host check in middleware for admin mutations (POST/PATCH/PUT/DELETE) provides a second layer of protection.

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/csrf.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { isSameSiteRequest } from '../csrf'
import { NextRequest } from 'next/server'

function makeReq(overrides: { origin?: string; referer?: string } = {}) {
  const headers: Record<string, string> = { host: 'app.turboware.com' }
  if (overrides.origin)  headers['origin']  = overrides.origin
  if (overrides.referer) headers['referer'] = overrides.referer
  return new NextRequest('https://app.turboware.com/api/admin/test', {
    method: 'POST',
    headers,
  })
}

describe('isSameSiteRequest', () => {
  it('allows request with matching Origin', () => {
    const req = makeReq({ origin: 'https://app.turboware.com' })
    expect(isSameSiteRequest(req)).toBe(true)
  })

  it('allows request with matching Referer', () => {
    const req = makeReq({ referer: 'https://app.turboware.com/admin/clients' })
    expect(isSameSiteRequest(req)).toBe(true)
  })

  it('blocks cross-origin Origin', () => {
    const req = makeReq({ origin: 'https://evil.com' })
    expect(isSameSiteRequest(req)).toBe(false)
  })

  it('blocks cross-origin Referer', () => {
    const req = makeReq({ referer: 'https://evil.com/attack' })
    expect(isSameSiteRequest(req)).toBe(false)
  })

  it('allows no Origin or Referer (direct API call)', () => {
    const req = makeReq()
    expect(isSameSiteRequest(req)).toBe(true)
  })

  it('blocks malformed Origin header', () => {
    const req = makeReq({ origin: 'not-a-url' })
    expect(isSameSiteRequest(req)).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/csrf.test.ts --reporter=verbose 2>&1 | tail -10
```

Expected: FAIL — `isSameSiteRequest is not a function`.

- [ ] **Step 3: Create src/lib/csrf.ts**

```typescript
import { NextRequest } from 'next/server'

/**
 * Returns true if the request originates from the same host.
 * Checks Origin first, falls back to Referer.
 * Requests with neither header are allowed (curl, Postman, server-to-server).
 */
export function isSameSiteRequest(req: NextRequest): boolean {
  const host    = req.headers.get('host')
  const origin  = req.headers.get('origin')
  const referer = req.headers.get('referer')

  if (!host) return false

  if (origin) {
    try {
      return new URL(origin).host === host
    } catch {
      return false
    }
  }

  if (referer) {
    try {
      return new URL(referer).host === host
    } catch {
      return false
    }
  }

  return true
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/lib/__tests__/csrf.test.ts --reporter=verbose 2>&1 | tail -10
```

Expected: PASS — 6 tests green.

- [ ] **Step 5: Apply CSRF check in middleware**

In `src/middleware.ts`, add import at top:

```typescript
import { isSameSiteRequest } from '@/lib/csrf'
```

Inside the admin auth block, after the JWT verify succeeds and before `return NextResponse.next()`, add:

```typescript
    try {
      const { payload } = await jwtVerify(token, getJwtSecret())
      if (payload.role !== 'admin') throw new Error()

      // Block cross-origin mutations on admin API
      if (isAdminApi && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
        if (!isSameSiteRequest(req)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      }

      return NextResponse.next()
    } catch {
```

- [ ] **Step 6: TypeScript check + full test run**

```bash
npx tsc --noEmit 2>&1 | head -10 && npx vitest run --reporter=verbose 2>&1 | tail -15
```

Expected: No TS errors; all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/csrf.ts src/lib/__tests__/csrf.test.ts src/middleware.ts
git commit -m "fix(security): add Origin/Referer CSRF check on admin API mutations"
```

---

## Task 4: Defensive Client-ID Validation (#15)

**Files:**
- Create: `src/lib/client-auth.ts`
- Create: `src/lib/__tests__/client-auth.test.ts`
- Modify: `src/app/api/client/subscription/route.ts`
- Modify: `src/app/api/client/subscription/billing-date/route.ts`
- Modify: `src/app/api/client/subscription/grace/route.ts`

**Context:** Every client API handler reads `x-client-id` from headers set by middleware after JWT verification. If middleware were bypassed, an arbitrary value could reach the DB. The fix adds CUID format validation (`/^c[a-z0-9]{24}$/`) before accepting the value.

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/client-auth.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { getClientId } from '../client-auth'
import { NextRequest } from 'next/server'

function makeReq(clientId?: string) {
  const headers: Record<string, string> = {}
  if (clientId !== undefined) headers['x-client-id'] = clientId
  return new NextRequest('http://localhost/api/client/subscription', { headers })
}

describe('getClientId', () => {
  it('returns a valid CUID from the header', () => {
    const id  = 'clh1234567890abcdefghijklm'
    const req = makeReq(id)
    expect(getClientId(req)).toBe(id)
  })

  it('returns null when header is missing', () => {
    expect(getClientId(makeReq())).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(getClientId(makeReq(''))).toBeNull()
  })

  it('returns null for SQL-like injection attempt', () => {
    expect(getClientId(makeReq("' OR 1=1 --"))).toBeNull()
  })

  it('returns null for UUID format (wrong format)', () => {
    expect(getClientId(makeReq('550e8400-e29b-41d4-a716-446655440000'))).toBeNull()
  })

  it('returns null for short strings', () => {
    expect(getClientId(makeReq('abc123'))).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/client-auth.test.ts --reporter=verbose 2>&1 | tail -10
```

Expected: FAIL — `getClientId is not a function`.

- [ ] **Step 3: Create src/lib/client-auth.ts**

```typescript
import { NextRequest } from 'next/server'

// Prisma CUIDs: start with 'c', exactly 25 lowercase alphanumeric chars
const CUID_RE = /^c[a-z0-9]{24}$/

/**
 * Reads x-client-id from headers (set by middleware after JWT verification).
 * Returns the value if it matches Prisma's CUID format, otherwise null.
 */
export function getClientId(req: NextRequest): string | null {
  const value = req.headers.get('x-client-id')
  if (!value || !CUID_RE.test(value)) return null
  return value
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/lib/__tests__/client-auth.test.ts --reporter=verbose 2>&1 | tail -10
```

Expected: PASS — 6 tests green.

- [ ] **Step 5: Apply to subscription/route.ts**

Add import at top of `src/app/api/client/subscription/route.ts`:
```typescript
import { getClientId } from '@/lib/client-auth'
```

In both `GET` and `POST` handlers, replace:
```typescript
// Before:
const clientId = req.headers.get('x-client-id')
// After:
const clientId = getClientId(req)
```

The `if (!clientId)` check below each line stays unchanged.

- [ ] **Step 6: Apply to billing-date/route.ts**

Add import at top of `src/app/api/client/subscription/billing-date/route.ts`:
```typescript
import { getClientId } from '@/lib/client-auth'
```

Replace:
```typescript
// Before:
const clientId = req.headers.get('x-client-id')
// After:
const clientId = getClientId(req)
```

- [ ] **Step 7: Apply to grace/route.ts**

Add import at top of `src/app/api/client/subscription/grace/route.ts`:
```typescript
import { getClientId } from '@/lib/client-auth'
```

Replace:
```typescript
// Before:
const clientId = req.headers.get('x-client-id')
// After:
const clientId = getClientId(req)
```

- [ ] **Step 8: TypeScript check + full test run**

```bash
npx tsc --noEmit 2>&1 | head -10 && npx vitest run --reporter=verbose 2>&1 | tail -15
```

Expected: No TS errors; all tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/lib/client-auth.ts src/lib/__tests__/client-auth.test.ts \
  src/app/api/client/subscription/route.ts \
  src/app/api/client/subscription/billing-date/route.ts \
  src/app/api/client/subscription/grace/route.ts
git commit -m "fix(security): validate x-client-id CUID format before trusting in API handlers"
```

---

## Task 5: Close #16 + Update SECURITY_AUDIT.md

- [ ] **Step 1: Update SECURITY_AUDIT.md — close #16 and mark #11 #12 #14 #15 complete**

In `SECURITY_AUDIT.md`:

**Close #16** — replace the body of issue 16 with:
```markdown
### 16. No Input Sanitization on Notes Fields
**Status**: ✅ CLOSED — All notes render as plain JSX `{value}` expressions.
React escapes these values automatically. No raw HTML injection is used near
user-generated content. No code changes required.
- [x] Verify frontend escapes license.notes
- [x] Verify frontend escapes internalNotes
- [x] Verify frontend escapes clientNotes
```

**Update Implementation Status section** — move #11, #12, #14, #15, #16 from ⏸️ Deferred to ✅ Completed. Update the summary table rows for these issues to show `[x]`.

**Update ⏸️ Deferred** — only #7 (email verification) remains:
```markdown
### ⏸️ Deferred

**HIGH (1):**
- [ ] #7: Email verification flow — requires email service + token system (separate plan, pending email provider decision)
```

- [ ] **Step 2: Verify tests still pass**

```bash
npx vitest run 2>&1 | tail -8
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add SECURITY_AUDIT.md
git commit -m "docs: close #16 XSS, mark #11 #12 #14 #15 complete in security audit"
```

- [ ] **Step 4: Push**

```bash
git push origin main
```

---

## Verification Checks

```bash
# Transition validation — should 400
curl -s -X PATCH http://localhost:3000/api/admin/clients/<id>/subscription \
  -H "Content-Type: application/json" \
  -H "Cookie: tw_admin_token=<token>" \
  -d '{"status":"TRIAL"}' | jq .
# Expected: { "error": "Invalid transition: ACTIVE → TRIAL" }

# CSRF block — should 403
curl -s -X POST http://localhost:3000/api/admin/clients \
  -H "Content-Type: application/json" \
  -H "Origin: https://evil.com" \
  -H "Cookie: tw_admin_token=<token>" \
  -d '{"name":"test"}' | jq .
# Expected: { "error": "Forbidden" }

# Client-ID format block — should 401
curl -s http://localhost:3000/api/client/subscription \
  -H "x-client-id: not-a-cuid" | jq .
# Expected: { "error": "Unauthorized" }
```
