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
| `DELETE` | `/api/admin/licenses/[id]` | Delete a license (owner/admin) |
| `GET`/`POST` | `/api/admin/team` | List/create helper operators (create is owner/admin) |
| `PATCH` | `/api/admin/team/[id]` | Update role or deactivate (owner/admin) |
| `GET` | `/api/admin/tickets` | Support inbox (filter by status/priority/clientId) |
| `POST` | `/api/admin/tickets` | Open a ticket for a client |
| `GET`/`PATCH` | `/api/admin/tickets/[id]` | Ticket thread + status |
| `POST` | `/api/admin/tickets/[id]/messages` | Reply as ADMIN |
| `GET` | `/api/admin/invoices` | All invoices |

---

## Admin UI

Protected by JWT middleware (`/admin/*`).

| Route | Description |
|---|---|
| `/login` | Admin login page |
| `/admin` | Dashboard with stats |
| `/admin/clients/new` | Guided tenant setup (client + plan + license) |
| `/admin/licenses` | Filterable license list |
| `/admin/licenses/new` | Generate a new license key |
| `/admin/licenses/[id]` | Detail page: revoke, suspend, activate, delete |
| `/admin/tickets` | Customer support inbox |
| `/admin/invoices` | Billing invoice list |
| `/admin/team` | Helper admin users |

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
| `TURBOWARE_DB` | PostgreSQL connection string (Render, schema `turboware`) |
| `ADMIN_PASSWORD` | Password for admin login |
| `JWT_SECRET` | Secret used to sign admin JWT cookies |
| `CRON_SECRET` | Bearer token for `/api/cron/billing` (required in production; Vercel injects it) |
| `ASAAS_API_KEY` | Asaas payments + webhook `asaas-access-token` |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe Checkout + webhook signature |
| `GLOBAL_CONFIG` | Global Config connection string. Vercel injects this when the store is connected to the project. Legacy name `EDGE_CONFIG` is also read. If neither is set, maintenance mode stays off. |
| `MAINTENANCE_BYPASS_TOKEN` | Optional secret for `?bypass=` during maintenance. Set it once; changing it needs a redeploy. Use `openssl rand -hex 32`. |

---

## Maintenance mode

Kevin can turn maintenance on for a database cutover and turn it off again without another deploy. Middleware reads the Global Config key `maintenance` on each request (Vercel’s current name for Edge Config). The value is:

```json
{
  "enabled": true,
  "message": "Migração do banco de dados em andamento.",
  "eta": "hoje às 18h (horário de Brasília)",
  "allowIps": ["203.0.113.10"]
}
```

`enabled` has to be a boolean. `message`, `eta`, and `allowIps` are optional. A missing store, a missing key, a value that is not that shape, or a failed read all **fail open**: the site keeps serving. The flag is never allowed to take the site down just because it could not be read.

`@vercel/global-config` is used instead of `@vercel/edge-config`. Connecting a store in the current Vercel dashboard writes `GLOBAL_CONFIG`. The new SDK reads that variable and falls back to legacy `EDGE_CONFIG`. The old package only reads `EDGE_CONFIG`, so a newly connected store would leave maintenance stuck off.

While `enabled` is `true`:

- Page requests get the branded maintenance document, HTTP 503, `Retry-After`, and `Cache-Control: no-store`. Copy is Portuguese first, with English underneath. `message` is shown as written. An ISO-8601 `eta` is shown in Brasília time; any other string is shown as written. `Retry-After` is the seconds until an ISO `eta` (between 60 and 86400), or 3600 when `eta` is missing or not a timestamp.
- `/api/*` gets JSON 503: `{ "error": "maintenance", "message": string | null, "eta": string | null }`.

Maintenance runs before the admin and client auth checks. A bypass does not skip login.

### One-time Vercel setup

Team `kcbsilvas-projects`, project `turboware-v2`. Create the store if this project does not already have one connected.

1. In the Vercel dashboard for that team, open **Storage** → **Create** → **Global Config**. Name it `turboware`. Older screens still say Edge Config; it is the same product, and `vercel edge-config` is an alias of the commands below.
2. Connect the store to project **turboware-v2** for Production, Preview, and Development. Connecting writes `GLOBAL_CONFIG` on the project. Do not copy that connection string into git.
3. In the project’s **Settings → Environment Variables**, add `MAINTENANCE_BYPASS_TOKEN` for the same environments (`openssl rand -hex 32`).
4. Redeploy **once** so those variables are present at runtime. After this deploy, flipping the flag does not need a deploy.
5. Seed the key in the off position (skip `add` if the dashboard create already made the store, and use the `update` command with `"enabled": false` instead):

```bash
vercel global-config add turboware --scope kcbsilvas-projects \
  --items '{"maintenance":{"enabled":false}}'
```

### Turn it on

Dashboard: **Storage → turboware → maintenance → edit the JSON → Save**.

Or, from a machine logged into the team:

```bash
vercel global-config update turboware --scope kcbsilvas-projects --patch '{"items":[{"operation":"upsert","key":"maintenance","value":{"enabled":true,"message":"Migração do banco de dados em andamento.","eta":"hoje às 18h (horário de Brasília)"}}]}'
```

The update propagates to the edge without a deployment. Give it a few seconds, then hard-refresh.

### Turn it off

```bash
vercel global-config update turboware --scope kcbsilvas-projects --patch '{"items":[{"operation":"upsert","key":"maintenance","value":{"enabled":false}}]}'
```

Leaving `message` and `eta` off the object is fine. `"enabled": false` is what opens the site.

### Bypass, so the real site can be checked during the window

- **IP allow list.** `allowIps` is exact addresses (no CIDR). Middleware compares them to `x-vercel-forwarded-for` (the client IP Vercel sets), then `x-real-ip`, then the first `x-forwarded-for` hop. Edit the same Global Config item to add or remove an IP; that also needs no redeploy.
- **Bypass cookie.** Open any page as `https://<domain>/?bypass=<MAINTENANCE_BYPASS_TOKEN>`. On GET/HEAD, middleware sets an HttpOnly cookie `tw_maintenance_bypass` for 12 hours and redirects to the same URL without the query. Later browser requests, including `/api/*`, send the cookie. A POST that includes a matching `?bypass=` is allowed for that request only and does not set the cookie. Auth still applies. The token has to already be deployed; rotating it is an env change, not how maintenance is toggled. The token appears in that first request URL, so prefer the hex secret above and do not share the link.

### What keeps working, and what is deliberately stopped

| Request | During maintenance |
|---|---|
| `/_next/static`, `/_next/image`, `/_next/*`, `/_vercel/*` | Served. These are framework and platform files. Blocking them breaks the bypass session. |
| `/favicon.ico`, `/favicon.svg`, `/favicon-16.png`, `/favicon-32.png`, `/apple-touch-icon.png`, and other `.svg` `.png` `.jpg` `.jpeg` `.gif` `.webp` `.ico` `.woff` `.woff2` files outside `/api` | Served. Browser icons and public files such as `/slides/*`. The maintenance document inlines the Turboware mark, so it does not depend on them. |
| `/api/cron/billing` | **503 JSON.** The cron writes invoices and subscription state. A failed run is safer mid-migration; Vercel Cron tries again on the next 08:00 UTC schedule. |
| `/api/webhooks/stripe`, `/api/webhooks/asaas` | **503 JSON.** Both mark invoices paid. Stripe and Asaas retry 503s, which is safer than writing payments while the database is moving. |
| Every other page and `/api/*` route | Maintenance response. License validate/activate included, so product clients get a controlled outage instead of a partial database error. |

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
│   ├── middleware.ts                           # Maintenance mode, then JWT auth for /admin and /client
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
│       │           ├── ClientNavBar.tsx
│       │           └── tabs/
│       │               ├── OverviewTab.tsx
│       │               ├── LicensesTab.tsx
│       │               ├── BillingTab.tsx
│       │               ├── TicketsTab.tsx
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
