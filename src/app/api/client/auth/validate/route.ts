import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/client/auth/validate
 *
 * Periodic re-validation endpoint called by TurboISP on startup and on a
 * recurring schedule to confirm the subscription is still active.
 *
 * Does NOT require a password — uses the hardwareId as proof of prior
 * activation (the machine already went through the full activate flow).
 *
 * Body: { cnpj: string, hardwareId: string }
 *
 * Returns: same plan/permissions structure as /api/client/auth/activate,
 *          or 401 if the machine was not previously activated.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  const { cnpj, hardwareId } = body as { cnpj?: string; hardwareId?: string }

  if (!cnpj || !hardwareId) {
    return NextResponse.json(
      { success: false, message: 'cnpj and hardwareId are required' },
      { status: 400 },
    )
  }

  // ── 1. Find client by CNPJ ─────────────────────────────────────────────────
  const normalized = cnpj.replace(/\D/g, '')

  const client = await prisma.client.findFirst({
    where: {
      OR: [{ cnpj: normalized }, { cnpj: cnpj.trim() }],
    },
    select: { id: true, name: true, cnpj: true },
  })

  if (!client) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Find activation by hardwareId under this client's licenses ──────────
  const activation = await prisma.activation.findFirst({
    where: {
      hardwareId,
      license: { clientId: client.id },
    },
    include: {
      license: true,
    },
  })

  if (!activation) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized — this machine has not been activated' },
      { status: 401 },
    )
  }

  // ── 3. Update lastSeenAt ───────────────────────────────────────────────────
  await prisma.activation.update({
    where: { id: activation.id },
    data: { lastSeenAt: new Date() },
  })

  // ── 4. Load subscription ───────────────────────────────────────────────────
  const subscription = await prisma.subscription.findUnique({
    where: { clientId: client.id },
  })

  if (!subscription) {
    return NextResponse.json(
      { success: false, message: 'No subscription found for this account' },
      { status: 402 },
    )
  }

  // ── 5. Build response ──────────────────────────────────────────────────────
  const tierStr = subscription.subscriberTier ?? String(subscription.seats)
  const maxSubs = Number(tierStr) || subscription.seats

  const FULL_MODULES = ['subscribers', 'billing', 'noc', 'infrastructure', 'hr', 'inventory']

  return NextResponse.json({
    success: true,
    clientId: client.id,
    clientName: client.name,
    plan: {
      region:         subscription.region ?? 'BR',
      subscriberTier: tierStr,
      monthlyAmount:  subscription.monthlyAmount ?? null,
      status:         subscription.status,
      trialEndsAt:    subscription.trialEndsAt?.toISOString() ?? null,
    },
    permissions: {
      maxSubscribers: maxSubs,
      modules:        FULL_MODULES,
    },
    activatedAt: activation.activatedAt.toISOString(),
    hardwareId,
  })
}
