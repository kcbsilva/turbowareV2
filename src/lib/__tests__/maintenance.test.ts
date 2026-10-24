import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createClient } from '@vercel/global-config'
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'
import {
  MAINTENANCE_BYPASS_MAX_AGE_SECONDS,
  MAINTENANCE_COOKIE,
  clientIp,
  decideMaintenance,
  isExemptPath,
  normalizeIp,
  parseMaintenanceConfig,
  renderMaintenancePage,
  retryAfterSeconds,
  tokensMatch,
} from '@/lib/maintenance'

vi.mock('@vercel/global-config', () => ({
  createClient: vi.fn(),
}))

const ENV_KEYS = ['GLOBAL_CONFIG', 'EDGE_CONFIG', 'MAINTENANCE_BYPASS_TOKEN'] as const
const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]])) as Record<
  (typeof ENV_KEYS)[number],
  string | undefined
>

const CONNECTION = 'https://global-config.vercel.com/ecfg_test?token=secret'

function restoreEnv() {
  for (const key of ENV_KEYS) {
    const value = originalEnv[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
}

function installConfig(value: unknown) {
  const get = vi.fn().mockResolvedValue(value)
  vi.mocked(createClient).mockReturnValue({ get } as never)
  return get
}

function enableMaintenance(value: Record<string, unknown> = {}) {
  process.env.GLOBAL_CONFIG = CONNECTION
  return installConfig({ enabled: true, ...value })
}

function request(path: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(`https://app.turboware.com${path}`, init)
}

function isPassThrough(response: Response) {
  return response.headers.get('x-middleware-next') === '1'
}

describe('maintenance parsing and bypass rules', () => {
  it('accepts only a boolean enabled flag and ignores bad optional fields', () => {
    expect(parseMaintenanceConfig(null)).toBeNull()
    expect(parseMaintenanceConfig('true')).toBeNull()
    expect(parseMaintenanceConfig({ enabled: 'true' })).toBeNull()
    expect(parseMaintenanceConfig({ enabled: 1 })).toBeNull()
    expect(parseMaintenanceConfig({
      enabled: true,
      message: '  Olá  ',
      eta: '',
      allowIps: [' 203.0.113.10 ', 42, '::ffff:203.0.113.11', '2001:DB8::1'],
      extra: true,
    })).toEqual({
      enabled: true,
      message: 'Olá',
      eta: undefined,
      allowIps: ['203.0.113.10', '203.0.113.11', '2001:db8::1'],
    })
  })

  it('normalizes client IPs and trusts the Vercel header over a spoofed forwarding header', () => {
    expect(normalizeIp(' 203.0.113.10:443 ')).toBe('203.0.113.10')
    expect(normalizeIp('[2001:db8::1]:443')).toBe('2001:db8::1')
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.10',
      'x-real-ip': '203.0.113.10',
      'x-vercel-forwarded-for': '198.51.100.8, 203.0.113.10',
    })
    expect(clientIp(headers)).toBe('198.51.100.8')
  })

  it('compares bypass tokens without treating an empty secret as a match', () => {
    expect(tokensMatch('secret', 'secret')).toBe(true)
    expect(tokensMatch('secret', 'secreT')).toBe(false)
    expect(tokensMatch('secret', 'secret-longer')).toBe(false)
    expect(tokensMatch('', 'secret')).toBe(false)
    expect(tokensMatch('secret', '')).toBe(false)
    expect(tokensMatch(null, 'secret')).toBe(false)
  })

  it('uses an hour when ETA is missing or prose, and seconds until a timestamp otherwise', () => {
    const now = Date.parse('2026-10-24T16:00:00.000Z')
    expect(retryAfterSeconds(undefined, now)).toBe(3600)
    expect(retryAfterSeconds('hoje às 18h', now)).toBe(3600)
    expect(retryAfterSeconds('2026-10-24T16:05:00.000Z', now)).toBe(300)
    expect(retryAfterSeconds('2026-10-24T15:00:00.000Z', now)).toBe(60)
    expect(retryAfterSeconds('2026-10-28T16:00:00.000Z', now)).toBe(24 * 60 * 60)
  })

  it('exempts static assets and keeps cron and payment webhooks on the maintenance path', () => {
    expect(isExemptPath('/_next/static/chunks/app.js')).toBe(true)
    expect(isExemptPath('/_next/image')).toBe(true)
    expect(isExemptPath('/favicon.svg')).toBe(true)
    expect(isExemptPath('/slides/billing.png')).toBe(true)
    expect(isExemptPath('/api/cron/billing')).toBe(false)
    expect(isExemptPath('/api/webhooks/stripe')).toBe(false)
    expect(isExemptPath('/api/webhooks/asaas')).toBe(false)
    expect(isExemptPath('/api/foo.png')).toBe(false)
    expect(isExemptPath('/site')).toBe(false)
  })

  it('renders Portuguese first, English second, and escapes operator text', () => {
    const html = renderMaintenancePage({
      message: '<script>alert("x")</script>',
      eta: 'hoje às 18h',
      now: new Date('2026-10-24T16:40:00.000Z'),
    })
    expect(html).toContain('lang="pt-BR"')
    expect(html).toContain('Em manutenção')
    expect(html).toContain('Under maintenance')
    expect(html).toContain('© 2026 Turboware')
    expect(html).toContain('hoje às 18h')
    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;')
    expect(html).not.toContain('<script>alert')
  })

  it('formats an ISO ETA in Brasília time', () => {
    const html = renderMaintenancePage({ eta: '2026-10-24T21:00:00.000Z' })
    expect(html).toContain('outubro')
    expect(html).toContain('18:00')
    expect(html).toContain('Estimated return:')
    expect(html).toContain('October')
  })

  it('decides page, API, fail-open, and bypass outcomes', () => {
    const base = {
      pathname: '/site',
      method: 'GET',
      bypassQuery: null,
      cookie: null,
      ip: null,
      edgeConfigConfigured: true,
      bypassToken: 'secret',
      rawConfig: { enabled: true, message: 'Migração', eta: 'hoje às 18h' },
    }
    expect(decideMaintenance(base).kind).toBe('page')
    expect(decideMaintenance({ ...base, pathname: '/api/client/validate' }).kind).toBe('api')
    expect(decideMaintenance({ ...base, edgeConfigConfigured: false }).kind).toBe('continue')
    expect(decideMaintenance({ ...base, rawConfig: { enabled: false } }).kind).toBe('continue')
    expect(decideMaintenance({ ...base, rawConfig: { enabled: 'true' } }).kind).toBe('continue')
    expect(decideMaintenance({ ...base, rawConfig: undefined }).kind).toBe('continue')
    expect(decideMaintenance({ ...base, bypassQuery: 'secret' }).kind).toBe('bypass')
    expect(decideMaintenance({ ...base, method: 'POST', bypassQuery: 'secret' }).kind).toBe('continue')
    expect(decideMaintenance({ ...base, cookie: 'secret' }).kind).toBe('continue')
    expect(decideMaintenance({
      ...base,
      ip: '203.0.113.10',
      rawConfig: { enabled: true, allowIps: ['203.0.113.10'] },
    }).kind).toBe('continue')
    expect(decideMaintenance({ ...base, pathname: '/favicon.svg' }).kind).toBe('continue')
  })
})

describe('middleware maintenance gate', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.unstubAllEnvs()
    restoreEnv()
    delete process.env.GLOBAL_CONFIG
    delete process.env.EDGE_CONFIG
    delete process.env.MAINTENANCE_BYPASS_TOKEN
    vi.mocked(createClient).mockReset()
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    errorSpy.mockRestore()
  })

  afterAll(() => {
    restoreEnv()
  })

  it('fails open when no config store is connected and does not call the SDK', async () => {
    const response = await middleware(request('/site'))
    expect(isPassThrough(response)).toBe(true)
    expect(createClient).not.toHaveBeenCalled()
  })

  it('fails open when the read throws, without logging the connection secret', async () => {
    process.env.GLOBAL_CONFIG = CONNECTION
    vi.mocked(createClient).mockImplementation(() => {
      throw new Error(`Invalid connection string ${CONNECTION}`)
    })
    const response = await middleware(request('/'))
    expect(isPassThrough(response)).toBe(true)
    const logged = errorSpy.mock.calls.flat().join(' ')
    expect(logged).toContain('failing open')
    expect(logged).not.toContain('secret')
    expect(logged).not.toContain('token=')
  })

  it('fails open when the stored value is missing or not strictly enabled', async () => {
    process.env.GLOBAL_CONFIG = CONNECTION
    installConfig(undefined)
    expect(isPassThrough(await middleware(request('/site')))).toBe(true)

    installConfig({ enabled: false, message: 'ignored' })
    expect(isPassThrough(await middleware(request('/site')))).toBe(true)

    installConfig({ enabled: 'true' })
    expect(isPassThrough(await middleware(request('/site')))).toBe(true)
  })

  it('prefers GLOBAL_CONFIG and still reads a legacy EDGE_CONFIG connection', async () => {
    process.env.GLOBAL_CONFIG = CONNECTION
    process.env.EDGE_CONFIG = 'https://edge-config.vercel.com/ecfg_legacy?token=legacy'
    const get = installConfig({ enabled: false })
    await middleware(request('/site'))
    expect(createClient).toHaveBeenCalledWith(CONNECTION, { disableDevelopmentCache: true })
    expect(get).toHaveBeenCalledWith('maintenance')

    vi.mocked(createClient).mockClear()
    delete process.env.GLOBAL_CONFIG
    process.env.EDGE_CONFIG = '   '
    await middleware(request('/site'))
    expect(createClient).not.toHaveBeenCalled()

    process.env.EDGE_CONFIG = 'https://edge-config.vercel.com/ecfg_legacy?token=legacy'
    installConfig({ enabled: false })
    await middleware(request('/site'))
    expect(createClient).toHaveBeenCalledWith(
      'https://edge-config.vercel.com/ecfg_legacy?token=legacy',
      { disableDevelopmentCache: true },
    )
  })

  it('returns a no-store HTML 503 for pages, with Portuguese copy and Retry-After', async () => {
    enableMaintenance({ message: 'Migração do banco.', eta: 'hoje às 18h' })
    const response = await middleware(request('/site'))
    expect(response.status).toBe(503)
    expect(response.headers.get('content-type')).toContain('text/html')
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.headers.get('retry-after')).toBe('3600')
    const body = await response.text()
    expect(body).toContain('Em manutenção')
    expect(body).toContain('Under maintenance')
    expect(body).toContain('Migração do banco.')
    expect(body).toContain('hoje às 18h')
  })

  it('returns JSON 503 for API routes, including cron and payment webhooks', async () => {
    enableMaintenance({ message: 'Migração do banco.', eta: 'hoje às 18h' })
    for (const path of ['/api/client/validate', '/api/cron/billing', '/api/webhooks/stripe', '/api/webhooks/asaas']) {
      const response = await middleware(request(path, { method: 'POST' }))
      expect(response.status, path).toBe(503)
      expect(response.headers.get('cache-control')).toBe('no-store')
      expect(response.headers.get('retry-after')).toBe('3600')
      expect(response.headers.get('content-type')).toContain('application/json')
      expect(await response.json()).toEqual({
        error: 'maintenance',
        message: 'Migração do banco.',
        eta: 'hoje às 18h',
      })
    }
  })

  it('omits message and eta as null when the flag does not set them', async () => {
    enableMaintenance()
    const response = await middleware(request('/api/auth/login', { method: 'POST' }))
    expect(await response.json()).toEqual({ error: 'maintenance', message: null, eta: null })
  })

  it('does not block static assets, and does not read the flag for them', async () => {
    process.env.GLOBAL_CONFIG = CONNECTION
    installConfig({ enabled: true })
    for (const path of ['/favicon.svg', '/slides/billing.png', '/_next/static/app.js']) {
      const response = await middleware(request(path))
      expect(isPassThrough(response), path).toBe(true)
    }
    expect(createClient).not.toHaveBeenCalled()
  })

  it('sets the bypass cookie from the query, then still enforces auth', async () => {
    process.env.MAINTENANCE_BYPASS_TOKEN = 's3cret'
    enableMaintenance()
    const armed = await middleware(request('/admin?bypass=s3cret&next=licenses'))
    expect(armed.status).toBe(307)
    const location = armed.headers.get('location') ?? ''
    expect(location).toContain('/admin')
    expect(location).toContain('next=licenses')
    expect(location).not.toContain('bypass')
    const cookie = armed.headers.get('set-cookie') ?? ''
    expect(cookie).toContain(`${MAINTENANCE_COOKIE}=s3cret`)
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('Path=/')
    expect(cookie).toContain(`Max-Age=${MAINTENANCE_BYPASS_MAX_AGE_SECONDS}`)
    expect(cookie).toContain('SameSite=lax')
    expect(cookie).not.toContain('Secure')
    expect(createClient).not.toHaveBeenCalled()

    const followUp = await middleware(request('/admin', {
      headers: { cookie: `${MAINTENANCE_COOKIE}=s3cret` },
    }))
    expect(followUp.status).toBe(307)
    expect(followUp.headers.get('location')).toContain('/admin/login')
  })

  it('marks the bypass cookie Secure in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    process.env.MAINTENANCE_BYPASS_TOKEN = 's3cret'
    const response = await middleware(request('/?bypass=s3cret'))
    expect(response.headers.get('set-cookie')).toContain('Secure')
  })

  it('does not bypass when the token is wrong', async () => {
    process.env.MAINTENANCE_BYPASS_TOKEN = 's3cret'
    enableMaintenance()
    const response = await middleware(request('/site?bypass=nope'))
    expect(response.status).toBe(503)
    expect(response.headers.get('set-cookie')).toBeNull()
  })

  it('lets an allow-listed Vercel IP through and ignores a spoofed forwarding header', async () => {
    enableMaintenance({ allowIps: ['203.0.113.10'] })
    const allowed = await middleware(request('/site', {
      headers: { 'x-vercel-forwarded-for': '::ffff:203.0.113.10' },
    }))
    expect(isPassThrough(allowed)).toBe(true)

    const spoofed = await middleware(request('/site', {
      headers: {
        'x-forwarded-for': '203.0.113.10',
        'x-vercel-forwarded-for': '198.51.100.8',
      },
    }))
    expect(spoofed.status).toBe(503)
  })

  it('runs before auth while the flag is on, and leaves auth in place while it is off', async () => {
    enableMaintenance()
    const adminPage = await middleware(request('/admin'))
    expect(adminPage.status).toBe(503)
    expect(await adminPage.text()).toContain('Em manutenção')

    const adminApi = await middleware(request('/api/admin/licenses'))
    expect((await adminApi.json()).error).toBe('maintenance')

    installConfig({ enabled: false })
    const login = await middleware(request('/admin'))
    expect(login.status).toBe(307)
    expect(login.headers.get('location')).toContain('/admin/login')

    const unauthorized = await middleware(request('/api/admin/licenses'))
    expect(unauthorized.status).toBe(401)
    expect(await unauthorized.json()).toEqual({ error: 'Unauthorized' })

    const client = await middleware(request('/client/dashboard'))
    expect(client.status).toBe(307)
    expect(client.headers.get('location')).toContain('/client/login')

    const site = await middleware(request('/site'))
    expect(isPassThrough(site)).toBe(true)

    const adminLogin = await middleware(request('/admin/login'))
    expect(isPassThrough(adminLogin)).toBe(true)
  })
})
