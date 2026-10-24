import { createClient } from '@vercel/global-config'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Runtime maintenance flag, read from Vercel Global Config (the current name
 * for Edge Config). The SDK reads `GLOBAL_CONFIG` and falls back to legacy
 * `EDGE_CONFIG`. A missing store or a failed read fails open: the site stays up.
 *
 * Key `maintenance`:
 * `{ enabled: boolean, message?: string, eta?: string, allowIps?: string[] }`
 * `enabled` must be a real boolean. Anything else is treated as off.
 */

export const MAINTENANCE_CONFIG_KEY = 'maintenance'
export const MAINTENANCE_COOKIE = 'tw_maintenance_bypass'
export const MAINTENANCE_BYPASS_MAX_AGE_SECONDS = 60 * 60 * 12
export const DEFAULT_RETRY_AFTER_SECONDS = 3600
export const MIN_RETRY_AFTER_SECONDS = 60
export const MAX_RETRY_AFTER_SECONDS = 24 * 60 * 60

const LOGO_SVG = `<svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Turboware"><rect width="128" height="128" rx="28" fill="#14212c"></rect><g fill="#1b9be0" transform="translate(64,25) matrix(1,0,-0.21256,1,5.952,0)"><rect x="-25" width="50" height="13"></rect><rect x="-7" width="14" height="56"></rect></g><g fill="#9aa5ad" transform="translate(64,93) matrix(1,0,-0.44523,1,2.226,0)"><rect x="-26" width="52" height="10"></rect></g></svg>`

export type MaintenanceConfig = {
  enabled: boolean
  message?: string
  eta?: string
  allowIps: string[]
}

export type MaintenanceDecision =
  | { kind: 'continue' }
  | { kind: 'bypass' }
  | { kind: 'page'; message?: string; eta?: string; retryAfter: number }
  | { kind: 'api'; message?: string; eta?: string; retryAfter: number }

type HeaderSource = { get(name: string): string | null }

/**
 * Paths that must keep working while the flag is on.
 *
 * - `/_next/*` and `/_vercel/*`: framework and platform internals. Blocking
 *   them breaks assets for anyone using the bypass cookie.
 * - The favicon files and `/slides/*`: the only public binary assets. The
 *   maintenance document inlines its own logo. Paths are matched exactly,
 *   not by file extension, so `/api/admin/licenses/<id>.png` and
 *   `/wiki/article.PNG` still go through this middleware.
 *
 * Not exempt, on purpose: `/api/cron/billing`, `/api/webhooks/stripe`, and
 * `/api/webhooks/asaas`. All three write billing rows. During a database
 * cutover a 503 is the safe response — Vercel Cron records a failed run and
 * tries again on the next schedule, and Stripe/Asaas retry the webhook.
 */
export function isExemptPath(pathname: string): boolean {
  if (pathname.startsWith('/_next/') || pathname.startsWith('/_vercel/')) return true
  if (pathname.startsWith('/slides/')) return true
  if (pathname === '/favicon.ico' || pathname === '/favicon.svg') return true
  if (pathname === '/favicon-16.png' || pathname === '/favicon-32.png') return true
  if (pathname === '/apple-touch-icon.png') return true
  return false
}

export function isApiPath(pathname: string): boolean {
  return pathname === '/api' || pathname.startsWith('/api/')
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function normalizeIp(raw: string | null | undefined): string | null {
  if (!raw) return null
  let ip = raw.trim()
  if (!ip) return null
  if (ip.startsWith('[') && ip.includes(']')) {
    ip = ip.slice(1, ip.indexOf(']'))
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(ip)) {
    ip = ip.slice(0, ip.lastIndexOf(':'))
  }
  if (ip.toLowerCase().startsWith('::ffff:')) ip = ip.slice('::ffff:'.length)
  if (ip.includes(':')) ip = ip.toLowerCase()
  return ip || null
}

function firstHeaderIp(value: string | null): string | null {
  if (!value) return null
  return normalizeIp(value.split(',')[0])
}

/** Prefer the IP Vercel sets. `x-forwarded-for` is only a local/dev fallback. */
export function clientIp(headers: HeaderSource): string | null {
  return (
    firstHeaderIp(headers.get('x-vercel-forwarded-for')) ??
    firstHeaderIp(headers.get('x-real-ip')) ??
    firstHeaderIp(headers.get('x-forwarded-for'))
  )
}

export function tokensMatch(provided: string | null | undefined, expected: string | null | undefined): boolean {
  if (!provided || !expected) return false
  const left = new TextEncoder().encode(provided)
  const right = new TextEncoder().encode(expected)
  const length = Math.max(left.length, right.length)
  let diff = left.length ^ right.length
  for (let i = 0; i < length; i++) diff |= (left[i] ?? 0) ^ (right[i] ?? 0)
  return diff === 0
}

export function parseMaintenanceConfig(value: unknown): MaintenanceConfig | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  if (typeof record.enabled !== 'boolean') return null
  const message = typeof record.message === 'string' ? record.message.trim() : ''
  const eta = typeof record.eta === 'string' ? record.eta.trim() : ''
  const allowIps = Array.isArray(record.allowIps)
    ? record.allowIps.flatMap((entry) => {
        if (typeof entry !== 'string') return []
        const ip = normalizeIp(entry)
        return ip ? [ip] : []
      })
    : []
  return {
    enabled: record.enabled,
    message: message || undefined,
    eta: eta || undefined,
    allowIps,
  }
}

export function retryAfterSeconds(eta: string | undefined, now = Date.now()): number {
  if (!eta) return DEFAULT_RETRY_AFTER_SECONDS
  const parsed = Date.parse(eta)
  if (Number.isNaN(parsed)) return DEFAULT_RETRY_AFTER_SECONDS
  const delta = Math.round((parsed - now) / 1000)
  if (delta < MIN_RETRY_AFTER_SECONDS) return MIN_RETRY_AFTER_SECONDS
  if (delta > MAX_RETRY_AFTER_SECONDS) return MAX_RETRY_AFTER_SECONDS
  return delta
}

export function maintenanceConnectionString(): string | undefined {
  const value = process.env.GLOBAL_CONFIG?.trim() || process.env.EDGE_CONFIG?.trim()
  return value || undefined
}

function optionalText(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null
}

type FormattedEta = { pt: string; en: string }

function formatEta(eta: string): FormattedEta | null {
  const parsed = Date.parse(eta)
  if (Number.isNaN(parsed)) return null
  const date = new Date(parsed)
  try {
    const pt = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
    const en = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(date)
    return { pt, en }
  } catch {
    return null
  }
}

export function renderMaintenancePage(input: {
  message?: string
  eta?: string
  now?: Date
} = {}): string {
  const year = (input.now ?? new Date()).getFullYear()
  const message = input.message?.trim()
  const eta = input.eta?.trim()
  const formattedEta = eta ? formatEta(eta) : null

  const messageBlock = message
    ? `<section class="note"><p class="kicker">Aviso · Note</p><p class="note-body">${escapeHtml(message)}</p></section>`
    : ''

  const etaBlock = eta
    ? formattedEta
      ? `<section class="eta"><p class="kicker">Previsão de retorno</p><p class="eta-value">${escapeHtml(formattedEta.pt)}</p><p class="eta-en" lang="en">Estimated return: ${escapeHtml(formattedEta.en)} (Brasília)</p></section>`
      : `<section class="eta"><p class="kicker">Previsão de retorno · Estimated return</p><p class="eta-value">${escapeHtml(eta)}</p></section>`
    : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#07101d">
<title>Em manutenção · Turboware</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  html, body { margin: 0; min-height: 100%; }
  body {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 28px 16px;
    color: #f4f7fb;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
    background:
      radial-gradient(circle at top left, rgba(26,171,240,0.22), transparent 32%),
      radial-gradient(circle at bottom right, rgba(252,163,17,0.16), transparent 28%),
      linear-gradient(135deg, #07101d 0%, #09182b 42%, #081221 100%);
  }
  .dots {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);
    background-size: 26px 26px;
    mask-image: linear-gradient(to bottom, transparent, #000 14%, #000 86%, transparent);
  }
  .card {
    position: relative;
    z-index: 1;
    width: min(460px, 100%);
    border-radius: 22px;
    border: 1px solid rgba(255,255,255,0.10);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.045), transparent 88px),
      rgba(10,12,16,0.88);
    box-shadow: 0 24px 64px -24px rgba(0,0,0,0.85);
    padding: 36px 32px 26px;
  }
  .card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 28px;
    right: 28px;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, transparent, #1aabf0, transparent);
  }
  .brand { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .logo {
    width: 68px;
    height: 68px;
    filter: drop-shadow(0 8px 18px rgba(26,171,240,0.18));
  }
  .wordmark {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #d5dee8;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 22px auto 0;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid rgba(26,171,240,0.35);
    background: rgba(26,171,240,0.12);
    color: #d7f1ff;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #1aabf0;
    box-shadow: 0 0 0 4px rgba(26,171,240,0.16);
  }
  h1, h2, p { margin: 0; }
  .center { text-align: center; }
  h1 {
    margin-top: 18px;
    font-size: clamp(1.7rem, 5vw, 2.15rem);
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.15;
  }
  .lead {
    margin-top: 12px;
    color: #c5d0db;
    font-size: 0.98rem;
    line-height: 1.55;
  }
  .note, .eta {
    margin-top: 18px;
    padding: 14px 14px 13px;
    border-radius: 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .kicker {
    color: #8fb4cc;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .note-body, .eta-value {
    margin-top: 6px;
    color: #f4f7fb;
    font-size: 0.98rem;
    line-height: 1.5;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .eta-en {
    margin-top: 4px;
    color: #9aa8b5;
    font-size: 0.82rem;
    line-height: 1.4;
  }
  .en {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .en-kicker {
    color: #8ea0b0;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  h2 {
    margin-top: 6px;
    font-size: 1.05rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  .en p.lead { margin-top: 6px; font-size: 0.9rem; color: #aebac6; }
  footer {
    margin-top: 22px;
    text-align: center;
    color: #8b98a6;
    font-size: 0.75rem;
  }
  @media (max-width: 480px) {
    body { padding: 18px 14px; }
    .card { padding: 28px 20px 22px; border-radius: 18px; }
  }
</style>
</head>
<body>
  <div class="dots" aria-hidden="true"></div>
  <main class="card">
    <div class="brand">
      ${LOGO_SVG}
      <p class="wordmark">Turboware</p>
    </div>
    <div class="center"><p class="pill"><span class="dot" aria-hidden="true"></span>Manutenção programada</p></div>
    <div class="center">
      <h1>Em manutenção</h1>
      <p class="lead">Estamos realizando uma manutenção programada. O acesso será restabelecido assim que a atualização terminar.</p>
    </div>
    ${messageBlock}
    ${etaBlock}
    <section class="en" lang="en">
      <p class="en-kicker">English</p>
      <h2>Under maintenance</h2>
      <p class="lead">We're carrying out scheduled maintenance. Access will be restored as soon as the update is finished.</p>
    </section>
    <footer>© ${year} Turboware</footer>
  </main>
</body>
</html>`
}

export function decideMaintenance(input: {
  pathname: string
  method: string
  bypassQuery: string | null
  cookie: string | null
  ip: string | null
  edgeConfigConfigured: boolean
  bypassToken: string | undefined
  rawConfig: unknown
}): MaintenanceDecision {
  if (isExemptPath(input.pathname)) return { kind: 'continue' }

  const method = input.method.toUpperCase()
  const queryBypass = tokensMatch(input.bypassQuery, input.bypassToken)
  if (queryBypass && (method === 'GET' || method === 'HEAD')) return { kind: 'bypass' }
  if (queryBypass) return { kind: 'continue' }

  if (!input.edgeConfigConfigured) return { kind: 'continue' }

  const config = parseMaintenanceConfig(input.rawConfig)
  if (!config?.enabled) return { kind: 'continue' }

  if (input.ip && config.allowIps.includes(input.ip)) return { kind: 'continue' }
  if (tokensMatch(input.cookie, input.bypassToken)) return { kind: 'continue' }

  const payload = {
    message: config.message,
    eta: config.eta,
    retryAfter: retryAfterSeconds(config.eta),
  }
  return isApiPath(input.pathname) ? { kind: 'api', ...payload } : { kind: 'page', ...payload }
}

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex, nofollow',
}

function bypassRedirect(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone()
  url.searchParams.delete('bypass')
  const response = NextResponse.redirect(url)
  const token = process.env.MAINTENANCE_BYPASS_TOKEN
  if (token) {
    response.cookies.set({
      name: MAINTENANCE_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: MAINTENANCE_BYPASS_MAX_AGE_SECONDS,
    })
  }
  response.headers.set('cache-control', 'no-store')
  return response
}

function pageResponse(decision: Extract<MaintenanceDecision, { kind: 'page' }>): NextResponse {
  const html = renderMaintenancePage({ message: decision.message, eta: decision.eta })
  return new NextResponse(html, {
    status: 503,
    headers: {
      ...NO_STORE_HEADERS,
      'content-type': 'text/html; charset=utf-8',
      'retry-after': String(decision.retryAfter),
    },
  })
}

function apiResponse(decision: Extract<MaintenanceDecision, { kind: 'api' }>): NextResponse {
  return NextResponse.json(
    {
      error: 'maintenance',
      message: optionalText(decision.message),
      eta: optionalText(decision.eta),
    },
    {
      status: 503,
      headers: {
        ...NO_STORE_HEADERS,
        'retry-after': String(decision.retryAfter),
      },
    },
  )
}

/**
 * Read the flag. Never throws. Unconfigured and unreadable both fail open.
 * The error object is not logged: SDK errors can echo the connection string.
 */
export async function loadMaintenanceValue(): Promise<{ configured: boolean; value: unknown }> {
  const connection = maintenanceConnectionString()
  if (!connection) return { configured: false, value: undefined }
  try {
    const client = createClient(connection, { disableDevelopmentCache: true })
    const value = await client.get(MAINTENANCE_CONFIG_KEY)
    return { configured: true, value }
  } catch {
    console.error('[maintenance] Global Config read failed; failing open')
    return { configured: false, value: undefined }
  }
}

/** Returns a response that ends the request, or null to continue into auth. */
export async function maintenanceGate(req: NextRequest): Promise<NextResponse | null> {
  const pathname = req.nextUrl.pathname
  // Static files never depend on the flag store.
  if (isExemptPath(pathname)) return null

  const bypassQuery = req.nextUrl.searchParams.get('bypass')
  const bypassToken = process.env.MAINTENANCE_BYPASS_TOKEN
  const method = req.method.toUpperCase()
  // A valid bypass token is an explicit allow. Set the cookie before reading
  // the flag so the bypass does not depend on the store being reachable.
  if (tokensMatch(bypassQuery, bypassToken)) {
    if (method === 'GET' || method === 'HEAD') return bypassRedirect(req)
    return null
  }

  const loaded = await loadMaintenanceValue()
  const decision = decideMaintenance({
    pathname,
    method,
    bypassQuery,
    cookie: req.cookies.get(MAINTENANCE_COOKIE)?.value ?? null,
    ip: clientIp(req.headers),
    edgeConfigConfigured: loaded.configured,
    bypassToken,
    rawConfig: loaded.value,
  })

  if (decision.kind === 'continue') return null
  if (decision.kind === 'bypass') return bypassRedirect(req)
  if (decision.kind === 'api') return apiResponse(decision)
  return pageResponse(decision)
}
