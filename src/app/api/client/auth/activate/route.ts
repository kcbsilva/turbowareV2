import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/client/auth/activate
 *
 * Machine-to-machine endpoint called by TurboISP on first activation.
 * Replaces the license-key-based flow — the ISP operator authenticates
 * with the same CNPJ + password they use on turboware.com.br/client/login.
 *
 * Body: { cnpj: string, password: string, hardwareId: string }
 *
 * Returns: plan info, permissions, and activation metadata.
 *
 * Error codes:
 *   401 — CNPJ not found OR password wrong (same message, no enumeration)
 *   402 — Subscription is SUSPENDED or PENDING_PAYMENT
 *   403 — Subscription is CANCELLED
 *   400 — Missing required fields
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  const { cnpj, password, hardwareId } = body as {
    cnpj?: string
    password?: string
    hardwareId?: string
  }

  if (!cnpj || !password || !hardwareId) {
    return NextResponse.json(
      { success: false, message: 'cnpj, password, and hardwareId are required' },
      { status: 400 },
    )
  }

  // Normalize CNPJ — strip dots, slashes, dashes so any format matches
  const normalized = cnpj.replace(/\D/g, '')

  // ── 1. Look up client ───────────────────────────────────────────────────────
  const client = await prisma.client.findFirst({
    where: {
      OR: [{ cnpj: normalized }, { cnpj: cnpj.trim() }],
    },
    select: { id: true, name: true, cnpj: true, password: true },
  })

  // Use a constant-time compare even on not-found to resist timing attacks
  const DUMMY_HASH = '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345'
  const hashToCompare = client?.password ?? DUMMY_HASH
  const passwordValid = await bcrypt.compare(password, hashToCompare)

  if (!client || !client.password || !passwordValid) {
    return NextResponse.json(
      { success: false, message: 'Invalid CNPJ or password' },
      { status: 401 },
    )
  }

  // ── 2. Check subscription ───────────────────────────────────────────────────
  const subscription = await prisma.subscription.findUnique({
    where: { clientId: client.id },
    include: {
      license: { include: { activations: true } },
    },
  })

  if (!subscription) {
    return NextResponse.json(
      { success: false, message: 'No subscription found for this account' },
      { status: 402 },
    )
  }

  if (subscription.status === 'SUSPENDED' || subscription.status === 'PENDING_PAYMENT') {
    return NextResponse.json(
      {
        success: false,
        message: `Subscription is ${subscription.status === 'SUSPENDED' ? 'suspended' : 'pending payment'}. Please settle your outstanding balance.`,
        status: subscription.status,
      },
      { status: 402 },
    )
  }

  if (subscription.status === 'CANCELLED') {
    return NextResponse.json(
      { success: false, message: 'Subscription has been cancelled.', status: 'CANCELLED' },
      { status: 403 },
    )
  }

  // ── 3. Find or provision a License for this client ─────────────────────────
  // The activation record requires a licenseId. For credential-auth clients the
  // subscription may not have a license (new flow). We auto-provision one if needed.
  let license = subscription.license

  if (!license) {
    // Check if the client has any license not yet linked to the subscription
    const existingLicense = await prisma.license.findFirst({
      where: { clientId: client.id },
      include: { activations: true },
    })

    if (existingLicense) {
      license = existingLicense
      // Link it to the subscription if not already linked
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { licenseId: existingLicense.id },
      })
    } else {
      // Auto-provision a license for this client
      const autoKey = `TW-AUTO-${client.id.toUpperCase().slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`
      const newLicense = await prisma.license.create({
        data: {
          key: autoKey,
          product: 'TurboISP',
          notes: 'Auto-provisioned for credential-based activation',
          status: 'ACTIVE',
          maxSeats: subscription.seats,
          clientId: client.id,
        },
        include: { activations: true },
      })
      // Link to subscription
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { licenseId: newLicense.id },
      })
      license = newLicense
    }
  }

  // ── 4. Find or create Activation for this hardwareId ───────────────────────
  const existingActivation = license.activations.find((a) => a.hardwareId === hardwareId)

  let activation
  if (existingActivation) {
    activation = await prisma.activation.update({
      where: { id: existingActivation.id },
      data: { lastSeenAt: new Date() },
    })
  } else {
    activation = await prisma.activation.create({
      data: {
        licenseId: license.id,
        hardwareId,
        label: `credential-auth`,
      },
    })
  }

  // ── 5. Build response ───────────────────────────────────────────────────────
  const tierStr    = subscription.subscriberTier ?? String(subscription.seats)
  const maxSubs    = Number(tierStr) || subscription.seats

  const FULL_MODULES = ['subscribers', 'billing', 'noc', 'infrastructure', 'hr', 'inventory']

  return NextResponse.json({
    success: true,
    clientId: client.id,
    clientName: client.name,
    plan: {
      region:          subscription.region ?? 'BR',
      subscriberTier:  tierStr,
      monthlyAmount:   subscription.monthlyAmount ?? null,
      status:          subscription.status,
      trialEndsAt:     subscription.trialEndsAt?.toISOString() ?? null,
    },
    permissions: {
      maxSubscribers: maxSubs,
      modules:        FULL_MODULES,
    },
    activatedAt: activation.activatedAt.toISOString(),
    hardwareId,
  })
}
