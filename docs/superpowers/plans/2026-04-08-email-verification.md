# Email Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email verification to the registration flow so clients must confirm their email before they can log in, and reset verification when an admin changes a client's email.

**Architecture:** Four-part system — (1) a Nodemailer email utility in `src/lib/email.ts`, (2) a Prisma migration adding 3 fields to `Client`, (3) token generation wired into `POST /api/register`, (4) a `GET /api/verify-email` route that validates the token and marks the client as verified. Login is gated on `emailVerified`. Admin email changes reset the flag and trigger a new verification email.

**Tech Stack:** Next.js 14 App Router, Prisma 5, Nodemailer, Node.js `crypto` module, vitest

---

## Issues Addressed

| # | Severity | Issue |
|---|----------|-------|
| 7 | HIGH | No email verification — admin could steal emails, or clients register with someone else's email |

---

## Required Environment Variables

Add these to `.env` before testing:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=yourpassword
SMTP_FROM=TurbowareV2 <noreply@example.com>
APP_URL=http://localhost:3000
```

---

## Files Modified / Created

| File | Action | Purpose |
|------|--------|---------|
| `prisma/schema.prisma` | Modify | Add `emailVerified`, `emailVerificationToken`, `emailVerificationTokenExpiresAt` to Client |
| `src/lib/email.ts` | **Create** | Nodemailer transporter + `sendVerificationEmail()` |
| `src/lib/__tests__/email.test.ts` | **Create** | Unit tests for email utility (mocked nodemailer) |
| `src/app/api/register/route.ts` | Modify | Generate token + send verification email after client.create |
| `src/app/api/verify-email/route.ts` | **Create** | GET handler: validate token, mark emailVerified, redirect |
| `src/app/api/client/auth/login/route.ts` | Modify | Block login if `emailVerified` is false |
| `src/app/api/admin/clients/[id]/route.ts` | Modify | Reset `emailVerified` + resend when admin changes email |

---

## Task 1: Install nodemailer + Prisma migration

**Files:**
- Modify: `prisma/schema.prisma`
- Generate: `prisma/migrations/...add_email_verification/migration.sql`

- [ ] **Step 1: Install nodemailer**

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

Expected: `package.json` updated, no errors.

- [ ] **Step 2: Add fields to prisma/schema.prisma**

In the `Client` model, add after the `password` field:

```prisma
  emailVerified                   Boolean   @default(false)
  emailVerificationToken          String?   @unique
  emailVerificationTokenExpiresAt DateTime?
```

Full updated Client model for reference:
```prisma
model Client {
  id              String        @id @default(cuid())
  name            String
  email           String?
  phone           String?
  company         String?
  cnpj            String?       @unique
  password        String?
  emailVerified                   Boolean   @default(false)
  emailVerificationToken          String?   @unique
  emailVerificationTokenExpiresAt DateTime?
  internalNotes   String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  licenses        License[]
  clientNotes     ClientNote[]
  subscription    Subscription?
  subdomain       String?       @unique
  dnsRecordId     String?
  asaasCustomerId String?

  @@map("clients")
}
```

- [ ] **Step 3: Create migration without applying**

```bash
npx prisma migrate dev --name add_email_verification --create-only
```

Expected: migration file created at `prisma/migrations/<timestamp>_add_email_verification/migration.sql`.

- [ ] **Step 4: Backfill existing rows in the migration SQL**

Open the generated `migration.sql` file and append this line at the end:

```sql
-- Backfill: existing clients are already trusted, mark them as verified
UPDATE "clients" SET "emailVerified" = true;
```

- [ ] **Step 5: Apply the migration**

```bash
npx prisma migrate dev
```

Expected output contains: `The following migration(s) have been created and applied`.

- [ ] **Step 6: Verify Prisma client regenerated**

```bash
npx prisma generate 2>&1 | tail -3
```

Expected: `Generated Prisma Client`.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(email): add emailVerified + token fields to Client schema"
```

---

## Task 2: Nodemailer email utility

**Files:**
- Create: `src/lib/email.ts`
- Create: `src/lib/__tests__/email.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/email.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-id' })
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail: mockSendMail })),
  },
}))

import { sendVerificationEmail } from '../email'

describe('sendVerificationEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_USER = 'user@example.com'
    process.env.SMTP_PASS = 'secret'
    process.env.APP_URL   = 'https://app.turboware.com'
    delete process.env.SMTP_FROM
  })

  it('calls sendMail with the verification link in html and text', async () => {
    await sendVerificationEmail('client@example.com', 'abc123token')
    expect(mockSendMail).toHaveBeenCalledOnce()
    const mail = mockSendMail.mock.calls[0][0]
    expect(mail.to).toBe('client@example.com')
    expect(mail.html).toContain('https://app.turboware.com/api/verify-email?token=abc123token')
    expect(mail.text).toContain('https://app.turboware.com/api/verify-email?token=abc123token')
  })

  it('uses SMTP_FROM env var as sender when set', async () => {
    process.env.SMTP_FROM = 'Custom <custom@example.com>'
    await sendVerificationEmail('client@example.com', 'token')
    const mail = mockSendMail.mock.calls[0][0]
    expect(mail.from).toBe('Custom <custom@example.com>')
  })

  it('falls back to default sender when SMTP_FROM is not set', async () => {
    await sendVerificationEmail('client@example.com', 'token')
    const mail = mockSendMail.mock.calls[0][0]
    expect(mail.from).toContain('TurbowareV2')
  })

  it('uses APP_URL env var for the link base', async () => {
    process.env.APP_URL = 'https://custom.domain.com'
    await sendVerificationEmail('client@example.com', 'mytoken')
    const mail = mockSendMail.mock.calls[0][0]
    expect(mail.html).toContain('https://custom.domain.com/api/verify-email?token=mytoken')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/email.test.ts --reporter=verbose 2>&1 | tail -8
```

Expected: FAIL — `sendVerificationEmail is not a function`.

- [ ] **Step 3: Create src/lib/email.ts**

```typescript
import nodemailer from 'nodemailer'

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const baseUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const link    = `${baseUrl}/api/verify-email?token=${token}`
  const from    = process.env.SMTP_FROM ?? 'TurbowareV2 <noreply@turboware.com>'

  const transporter = createTransporter()
  await transporter.sendMail({
    from,
    to,
    subject: 'Verifique seu e-mail — TurbowareV2',
    text:    `Clique no link para verificar seu e-mail:\n\n${link}\n\nO link expira em 24 horas.`,
    html:    `<p>Clique no link abaixo para verificar seu e-mail:</p><p><a href="${link}">${link}</a></p><p>O link expira em 24 horas.</p>`,
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/lib/__tests__/email.test.ts --reporter=verbose 2>&1 | tail -10
```

Expected: PASS — 4 tests green.

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/email.ts src/lib/__tests__/email.test.ts
git commit -m "feat(email): add Nodemailer sendVerificationEmail utility"
```

---

## Task 3: Generate + store token on registration

**Files:**
- Modify: `src/app/api/register/route.ts`

**Context:** After `prisma.client.create(...)` on line 80, generate a 64-char hex token, store it with a 24h expiry, and call `sendVerificationEmail`. Email failure is non-fatal — log and continue so registration succeeds even if SMTP is down.

- [ ] **Step 1: Update register/route.ts**

Add imports at the top of `src/app/api/register/route.ts` (after existing imports):

```typescript
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/email'
```

After the `prisma.client.create(...)` block (after line 91 `}`), add:

```typescript
  // Generate email verification token
  const verificationToken   = crypto.randomBytes(32).toString('hex')
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await prisma.client.update({
    where: { id: client.id },
    data: {
      emailVerificationToken:          verificationToken,
      emailVerificationTokenExpiresAt: verificationExpires,
    },
  })

  // Send verification email — non-fatal if SMTP is down
  if (client.email) {
    try {
      await sendVerificationEmail(client.email, verificationToken)
    } catch (err) {
      console.error('[register] Failed to send verification email:', err)
    }
  }
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: No errors.

- [ ] **Step 3: Run all tests**

```bash
npx vitest run --reporter=verbose 2>&1 | tail -8
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add "src/app/api/register/route.ts"
git commit -m "feat(email): generate verification token + send email on registration"
```

---

## Task 4: Verify email route

**Files:**
- Create: `src/app/api/verify-email/route.ts`

**Context:** This is a GET endpoint — the link in the email points here. It reads `?token=...`, validates it, marks the client as verified, then redirects to `/client/login?verified=1`. The `verified=1` query param lets the login page show a success message.

- [ ] **Step 1: Create src/app/api/verify-email/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/verify-email?token=<hex-token>
 *
 * Validates the email verification token, marks the client as verified,
 * and redirects to the login page.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })
  }

  const client = await prisma.client.findFirst({
    where: { emailVerificationToken: token },
  })

  if (!client) {
    return NextResponse.json(
      { error: 'Invalid or already used verification token' },
      { status: 400 },
    )
  }

  if (
    !client.emailVerificationTokenExpiresAt ||
    client.emailVerificationTokenExpiresAt < new Date()
  ) {
    return NextResponse.json(
      { error: 'Verification token has expired. Please contact support.' },
      { status: 400 },
    )
  }

  await prisma.client.update({
    where: { id: client.id },
    data: {
      emailVerified:                   true,
      emailVerificationToken:          null,
      emailVerificationTokenExpiresAt: null,
    },
  })

  return NextResponse.redirect(new URL('/client/login?verified=1', req.url))
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: No errors.

- [ ] **Step 3: Run all tests**

```bash
npx vitest run 2>&1 | tail -5
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add "src/app/api/verify-email/route.ts"
git commit -m "feat(email): add GET /api/verify-email token validation route"
```

---

## Task 5: Gate login on emailVerified

**Files:**
- Modify: `src/app/api/client/auth/login/route.ts`

**Context:** The login route currently selects `{ id, password }` from the DB. Add `emailVerified` to the select, then check it before comparing the password — return 403 with a clear message if unverified.

- [ ] **Step 1: Update login/route.ts**

In `src/app/api/client/auth/login/route.ts`, replace the select block:

```typescript
// Before:
  const client = await prisma.client.findFirst({
    where: {
      OR: [
        { cnpj: normalized },
        { cnpj: cnpj.trim() },
      ],
    },
    select: { id: true, password: true },
  })

  if (!client || !client.password) {
    return NextResponse.json({ error: 'Invalid CNPJ or password' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, client.password)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid CNPJ or password' }, { status: 401 })
  }
```

```typescript
// After:
  const client = await prisma.client.findFirst({
    where: {
      OR: [
        { cnpj: normalized },
        { cnpj: cnpj.trim() },
      ],
    },
    select: { id: true, password: true, emailVerified: true },
  })

  if (!client || !client.password) {
    return NextResponse.json({ error: 'Invalid CNPJ or password' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, client.password)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid CNPJ or password' }, { status: 401 })
  }

  if (!client.emailVerified) {
    return NextResponse.json(
      { error: 'Por favor, verifique seu e-mail antes de fazer login.' },
      { status: 403 },
    )
  }
```

- [ ] **Step 2: TypeScript check + full test run**

```bash
npx tsc --noEmit 2>&1 | head -10 && npx vitest run 2>&1 | tail -5
```

Expected: No TS errors; all tests pass.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/client/auth/login/route.ts"
git commit -m "feat(email): block login until email is verified"
```

---

## Task 6: Reset verification on admin email change

**Files:**
- Modify: `src/app/api/admin/clients/[id]/route.ts`

**Context:** When an admin changes a client's email via PATCH, the old verification is invalidated. The plan: fetch the current email before the update, detect if it changed, generate a new token, include it in the update, and send a new verification email. Email failure is non-fatal.

- [ ] **Step 1: Update admin/clients/[id]/route.ts PATCH handler**

Full replacement of the PATCH handler in `src/app/api/admin/clients/[id]/route.ts`:

Add imports at the top of the file (after existing imports):
```typescript
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/email'
```

Replace the entire `PATCH` function:

```typescript
// PATCH /api/admin/clients/[id] — update fields
export async function PATCH(req: NextRequest, { params }: Params) {
  const { body: parsed, error } = await parseBody<{ name?: string; email?: string; phone?: string; company?: string; cnpj?: string; internalNotes?: string; newPassword?: string }>(req)
  if (error) return badRequest()
  const { name, email, phone, company, cnpj, internalNotes, newPassword } = parsed

  if (name !== undefined && !name?.trim()) {
    return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 })
  }

  // Hash new password if provided
  let passwordHash: string | undefined
  if (newPassword) {
    passwordHash = await bcrypt.hash(newPassword, 12)
  }

  // Detect email change — if email is changing, reset verification
  const existing = await prisma.client.findUnique({
    where: { id: params.id },
    select: { email: true },
  })

  const newEmail          = email !== undefined ? email?.trim().toLowerCase() || null : undefined
  const emailChanged      = newEmail !== undefined && newEmail !== existing?.email
  const verificationToken = emailChanged && newEmail ? crypto.randomBytes(32).toString('hex') : undefined

  const client = await prisma.client.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(email !== undefined ? { email: newEmail } : {}),
      ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
      ...(company !== undefined ? { company: company?.trim() || null } : {}),
      ...(cnpj !== undefined ? { cnpj: cnpj?.replace(/\D/g, '') || null } : {}),
      ...(internalNotes !== undefined ? { internalNotes: internalNotes?.trim() || null } : {}),
      ...(passwordHash ? { password: passwordHash } : {}),
      ...(emailChanged ? {
        emailVerified:                   false,
        emailVerificationToken:          verificationToken ?? null,
        emailVerificationTokenExpiresAt: verificationToken
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : null,
      } : {}),
    },
  })

  // Send new verification email if email changed — non-fatal
  if (emailChanged && newEmail && verificationToken) {
    try {
      await sendVerificationEmail(newEmail, verificationToken)
    } catch (err) {
      console.error('[admin/clients] Failed to send verification email:', err)
    }
  }

  const { password: _, ...safe } = client
  return NextResponse.json({ ...safe, hasPassword: !!client.password })
}
```

- [ ] **Step 2: TypeScript check + full test run**

```bash
npx tsc --noEmit 2>&1 | head -10 && npx vitest run 2>&1 | tail -5
```

Expected: No TS errors; all tests pass.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/admin/clients/[id]/route.ts"
git commit -m "feat(email): reset emailVerified and resend verification on admin email change"
```

---

## Task 7: Update SECURITY_AUDIT.md

- [ ] **Step 1: Mark #7 complete in SECURITY_AUDIT.md**

In `SECURITY_AUDIT.md`, replace the issue #7 checklist:

```markdown
### 7. No Email Verification
**Files**: `/api/register`, `/api/admin/clients/[id]`
**Risk**: An admin could steal someone's email by editing client record or registering with victim's email.
**Fix**: Add email verification flow with time-limited tokens
- [x] Create email verification token system (src/lib/email.ts + Nodemailer)
- [x] Add verification step to registration (token generated, email sent, login gated)
- [x] Validate email changes in admin client updates (resets emailVerified, resends email)
```

Update the summary table row:
```markdown
| No email verification | HIGH | Email takeover | [x] |
```

Update Implementation Status — move #7 from ⏸️ Deferred to a new ✅ Completed (Phase 3) section.

- [ ] **Step 2: Run all tests**

```bash
npx vitest run 2>&1 | tail -5
```

Expected: All tests pass.

- [ ] **Step 3: Commit + push**

```bash
git add SECURITY_AUDIT.md
git commit -m "docs: mark #7 email verification complete in security audit"
git push origin main
```

---

## Verification Checks

```bash
# 1. Register a new client — should succeed and send email
curl -s -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","financialEmail":"test@example.com","password":"pass123","acceptedTerms":true}' | jq .
# Expected: { "ok": true, "id": "c..." }

# 2. Attempt login before verifying — should 403
curl -s -X POST http://localhost:3000/api/client/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cnpj":"00000000000000","password":"pass123"}' | jq .
# Expected: { "error": "Por favor, verifique seu e-mail antes de fazer login." }

# 3. Verify email using token (copy from DB or email logs)
curl -s "http://localhost:3000/api/verify-email?token=<token>" -L
# Expected: redirects to /client/login?verified=1

# 4. Invalid token
curl -s "http://localhost:3000/api/verify-email?token=bad" | jq .
# Expected: { "error": "Invalid or already used verification token" }

# 5. Admin email change — check DB for new token
# PATCH /api/admin/clients/<id> with { "email": "new@example.com" }
# DB: emailVerified should be false, new token should be set
```
