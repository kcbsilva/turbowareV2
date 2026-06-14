import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'
import {
  createTurboISPTenant,
  deleteTurboISPTenant,
} from '@/lib/turboisp-bootstrap'
import { isValidSignupSlug, normalizeSignupSlug } from '@/lib/signup-slug'
import { regionForCountry } from '@/lib/signup-countries'
import { signupCorsPreflight, withSignupCors } from '@/lib/signup-cors'

function signupEnabled(): boolean {
  const v = (process.env.PUBLIC_SIGNUP_ENABLED ?? '').trim().toLowerCase()
  return v === '' || v === '1' || v === 'true' || v === 'yes'
}

function apiError(req: NextRequest, message: string, status: number) {
  return withSignupCors(req, NextResponse.json({ error: message }, { status }))
}

/** POST /api/signup — TurboISP tenant + Turboware billing client */
export async function OPTIONS(req: NextRequest) {
  return signupCorsPreflight(req) ?? new NextResponse(null, { status: 204 })
}

export async function POST(req: NextRequest) {
  const preflight = signupCorsPreflight(req)
  if (preflight) return preflight

  if (!signupEnabled()) {
    return apiError(req, 'public signup is disabled', 403)
  }

  const { body: parsed, error } = await parseBody(req)
  if (error) return withSignupCors(req, badRequest())

  const {
    name,
    slug: rawSlug,
    adminUsername,
    adminEmail,
    adminPassword,
    countryCode,
    currency,
  } = parsed as Record<string, string>

  const companyName = name?.trim() ?? ''
  const slug = normalizeSignupSlug(rawSlug || '')
  const email = adminEmail?.trim().toLowerCase() ?? ''
  const password = adminPassword ?? ''

  if (!companyName) return apiError(req, 'invalid request body', 400)
  if (!isValidSignupSlug(slug)) return apiError(req, 'invalid slug', 400)
  if (password.length < 8) {
    return apiError(req, 'password must be at least 8 characters', 400)
  }
  if (!email) return apiError(req, 'invalid request body', 400)

  const existingEmail = await prisma.client.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true },
  })
  if (existingEmail) {
    return apiError(req, 'email already in use', 409)
  }

  const existingSubdomain = await prisma.client.findFirst({
    where: { subdomain: slug },
    select: { id: true },
  })
  if (existingSubdomain) {
    return apiError(req, 'slug already in use', 409)
  }

  let bootstrap: Awaited<ReturnType<typeof createTurboISPTenant>>
  try {
    bootstrap = await createTurboISPTenant({
      name: companyName,
      slug,
      adminUsername: adminUsername?.trim() ?? '',
      adminEmail: email,
      adminPassword: password,
      countryCode: countryCode?.trim() ?? 'US',
      currency: currency?.trim() ?? 'USD',
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'signup failed'
    if (msg.includes('already in use')) {
      const status = msg.includes('username') || msg.includes('email') ? 409 : 409
      return apiError(req, msg, status)
    }
    if (msg.includes('invalid slug')) return apiError(req, msg, 400)
    console.error('[signup] TurboISP bootstrap failed:', err)
    return apiError(req, msg, 500)
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const region = regionForCountry(countryCode?.trim() ?? 'US')
  const adminUser = bootstrap.adminUsername

  let clientId: string
  try {
    const client = await prisma.client.create({
      data: {
        name: `${companyName} Admin`,
        email,
        company: companyName,
        password: passwordHash,
        subdomain: slug,
        internalNotes: [
          `TurboISP tenant: ${bootstrap.tenantId}`,
          `Admin username: ${adminUser}`,
          `Country: ${countryCode?.trim() ?? 'US'}`,
          `Currency: ${currency?.trim() ?? 'USD'}`,
          `Registered via: /turboisp/register`,
          `Registered on: ${new Date().toISOString()}`,
        ].join('\n'),
      },
      select: { id: true, email: true },
    })
    clientId = client.id

    const verificationToken = crypto.randomBytes(32).toString('hex')
    await prisma.client.update({
      where: { id: client.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    if (client.email) {
      try {
        await sendVerificationEmail(client.email, verificationToken)
      } catch (mailErr) {
        console.error('[signup] verification email failed:', mailErr)
      }
    }

    await prisma.subscription.create({
      data: {
        clientId: client.id,
        product: 'TurboISP',
        seats: 0,
        status: 'TRIAL',
        billingDate: 1,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        region,
      },
    })
  } catch (err) {
    console.error('[signup] Turboware client creation failed, rolling back tenant:', err)
    await deleteTurboISPTenant(bootstrap.tenantId).catch(() => null)
    return apiError(req, 'signup failed', 500)
  }

  return withSignupCors(
    req,
    NextResponse.json(
      {
        tenantId: bootstrap.tenantId,
        slug: bootstrap.slug,
        adminUsername: bootstrap.adminUsername,
        staffLoginUrl: bootstrap.staffLoginUrl,
        clientId,
        message:
          'Tenant created. Sign in with your admin credentials to complete setup.',
      },
      { status: 201 },
    ),
  )
}
