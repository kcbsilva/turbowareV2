# Turboware

License key authorization server for Turboware products. Built with Next.js 14 App Router, PostgreSQL, and Prisma ORM. Supports hardware-bound seat-limited licenses, client management, and subscription billing tracking.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Styling | Tailwind CSS |
| Auth | `jose` (JWT, HS256) |

---

## Database Schema

### `License`
| Field | Type | Description |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `key` | `String` (unique) | License key (`TW-XXXXXX-XXXXXX-XXXXXX-XXXXXX`) |
| `product` | `String` | Product name |
| `status` | `LicenseStatus` | `ACTIVE`, `SUSPENDED`, `REVOKED`, `EXPIRED` |
| `maxSeats` | `Int` | Max concurrent hardware activations |
| `expiresAt` | `DateTime?` | Optional expiry date |
| `clientId` | `String?` | FK to owning `Client` |

### `Activation`
| Field | Type | Description |
|---|---|---|
| `licenseId` | `String` | FK to `License` |
| `hardwareId` | `String` | Unique device identifier provided by the client |
| `label` | `String?` | Optional human-readable device name |
| `activatedAt` | `DateTime` | First activation timestamp |
| `lastSeenAt` | `DateTime` | Updated on each validate/activate call |

> `[licenseId, hardwareId]` is unique — one activation record per device per license.

### `Client`
Stores end-customer information: name, email, phone, company, CNPJ. Can have many licenses and one subscription.

### `Subscription`
Linked to a `Client` and optionally a `License`. Tracks billing state: `TRIAL`, `PENDING_PAYMENT`, `ACTIVE`, `SUSPENDED`, `CANCELLED`. Includes `billingDate` (day of month), trial/grace period timestamps.

### `Invoice`
Linked to a `Subscription`. Types: `INSTALLATION`, `MONTHLY`, `PRORATED`, `GRACE_FEE`. Statuses: `PENDING`, `PAID`, `OVERDUE`, `WAIVED`.

---

## License Key Format

```
TW-XXXXXX-XXXXXX-XXXXXX-XXXXXX
```

Generated using `crypto.randomBytes` (Node.js). Character set: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (unambiguous — no `I`, `O`, `0`, `1`).

---

## Client API (public — no auth required)

### `POST /api/client/validate`
Check if a license key is valid and usable.

**Request body:**
```json
{ "key": "TW-...", "hardwareId": "optional-device-id" }
```

**Behavior:**
- If `hardwareId` is provided and already activated, that seat is excluded from the seat-count check (idempotent for existing devices).
- Updates `lastSeenAt` on the matching activation if already active.

**Response (valid):**
```json
{
  "valid": true,
  "license": { "key", "product", "expiresAt", "maxSeats", "activatedSeats" }
}
```

---

### `POST /api/client/activate`
Bind a license key to a hardware device.

**Request body:**
```json
{ "key": "TW-...", "hardwareId": "device-id", "label": "optional-label" }
```

**Behavior:**
- Idempotent — if the device is already activated, updates `lastSeenAt` and returns `alreadyActivated: true`.
- Rejects if the license is revoked, suspended, expired, or at seat capacity.

---

### `GET /api/client/status/[key]`
Public metadata for a license key.

**Response:**
```json
{
  "key", "product", "status", "expiresAt",
  "maxSeats", "activatedSeats", "createdAt"
}
```

> `status` reflects the *effective* status — an `ACTIVE` license past its `expiresAt` is returned as `EXPIRED`.

---

## Admin API (requires admin JWT cookie)

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/admin/licenses` | List all licenses (filterable) |
| `POST` | `/api/admin/licenses` | Create a new license |
| `GET` | `/api/admin/licenses/[id]` | Get license details |
| `PATCH` | `/api/admin/licenses/[id]` | Update status, seats, expiry, etc. |
| `DELETE` | `/api/admin/licenses/[id]` | Delete a license |

---

## Admin UI

Protected by JWT middleware (`/admin/*`).

| Route | Description |
|---|---|
| `/login` | Admin login page |
| `/admin` | Dashboard with stats |
| `/admin/licenses` | Filterable license list |
| `/admin/licenses/new` | Generate a new license key |
| `/admin/licenses/[id]` | Detail page: revoke, suspend, activate, delete |

---

## Authentication

- Login: `POST /api/auth/login` with `{ password }` checked against `ADMIN_PASSWORD` env var.
- On success: sets an `HttpOnly` JWT cookie (12h expiry, signed with `JWT_SECRET`).
- Logout: `POST /api/auth/logout` clears the cookie.
- Middleware protects all `/admin/*` and `/api/admin/*` routes.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_PASSWORD` | Password for admin login |
| `JWT_SECRET` | Secret used to sign admin JWT cookies |

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up the database
npx prisma migrate dev

# Run the development server
npm run dev
```

---

## Project Structure

```
.
├── prisma/
│   └── schema.prisma                          # Database schema (License, Activation, Client, Subscription, Invoice)
├── src/
│   ├── middleware.ts                           # JWT auth guard for /admin/* and /api/admin/*
│   ├── lib/
│   │   ├── auth.ts                            # JWT sign/verify helpers
│   │   ├── license.ts                         # Key generation, status resolution, usability check
│   │   ├── pricing.ts                         # Subscription pricing logic
│   │   └── prisma.ts                          # Prisma client singleton
│   ├── components/
│   │   ├── Taskbar.tsx
│   │   ├── ThemeProvider.tsx
│   │   ├── WorktopDesktop.tsx
│   │   └── WorktopWindow.tsx
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── globals.css
│       ├── api/
│       │   ├── auth/
│       │   │   ├── login/route.ts             # POST — admin login (sets JWT cookie)
│       │   │   └── logout/route.ts            # POST — admin logout (clears cookie)
│       │   ├── client/
│       │   │   ├── auth/
│       │   │   │   ├── login/route.ts         # POST — client login
│       │   │   │   └── logout/route.ts        # POST — client logout
│       │   │   ├── activate/route.ts          # POST — bind key to hardwareId
│       │   │   ├── validate/route.ts          # POST — check if key is valid
│       │   │   ├── status/[key]/route.ts      # GET  — public key metadata
│       │   │   ├── subscription/
│       │   │   │   ├── route.ts               # GET  — client subscription info
│       │   │   │   ├── billing-date/route.ts  # PATCH — update billing date
│       │   │   │   └── grace/route.ts         # POST — request grace period
│       │   ├── admin/
│       │   │   ├── licenses/
│       │   │   │   ├── route.ts               # GET, POST — list/create licenses
│       │   │   │   └── [id]/route.ts          # GET, PATCH, DELETE — single license
│       │   │   └── clients/
│       │   │       ├── route.ts               # GET, POST — list/create clients
│       │   │       └── [id]/
│       │   │           ├── route.ts           # GET, PATCH, DELETE — single client
│       │   │           ├── notes/route.ts     # POST — add a client note
│       │   │           └── subscription/
│       │   │               ├── route.ts       # GET, POST, PATCH — client subscription
│       │   │               └── invoices/[invoiceId]/pay/route.ts  # POST — mark invoice paid
│       │   └── register/
│       │       ├── route.ts                   # POST — new client/product registration
│       │       └── ddns/route.ts              # POST — DDNS registration
│       ├── admin/                             # Admin UI (protected by middleware)
│       │   ├── layout.tsx
│       │   ├── page.tsx                       # Dashboard
│       │   ├── login/page.tsx
│       │   ├── licenses/
│       │   │   ├── page.tsx                   # License list
│       │   │   ├── new/
│       │   │   │   ├── page.tsx
│       │   │   │   └── NewLicenseForm.tsx
│       │   │   └── [id]/
│       │   │       ├── page.tsx
│       │   │       └── LicenseActions.tsx
│       │   └── clients/
│       │       ├── page.tsx                   # Client list
│       │       ├── new/page.tsx
│       │       └── [id]/
│       │           ├── layout.tsx
│       │           ├── page.tsx
│       │           ├── ClientHeader.tsx
│       │           ├── ClientSidebar.tsx
│       │           └── tabs/
│       │               ├── OverviewTab.tsx
│       │               ├── LicensesTab.tsx
│       │               ├── BillingTab.tsx
│       │               ├── NotesTab.tsx
│       │               └── HistoryTab.tsx
│       ├── client/                            # Client portal
│       │   ├── login/page.tsx
│       │   ├── dashboard/
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   └── components/
│       │       └── clientheader.tsx
│       └── turboisp/                          # TurboISP product pages
│           ├── register/
│           │   ├── layout.tsx
│           │   └── page.tsx
│           └── site/
│               ├── layout.tsx
│               └── page.tsx
```
