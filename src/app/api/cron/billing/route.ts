import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMonthlyPrice, nextBillingDate } from '@/lib/pricing'

/**
 * GET /api/cron/billing
 * Vercel cron endpoint — runs daily at 08:00 UTC (see vercel.json).
 * Protected by CRON_SECRET: Vercel injects `Authorization: Bearer <CRON_SECRET>`.
 * If CRON_SECRET is not set, the check is skipped (dev/local fallback).
 *
 * Responsibilities:
 *  1. TRIAL subscriptions past trialEndsAt → PENDING_PAYMENT + first MONTHLY invoice
 *  2. ACTIVE subscriptions past gracePeriodEndsAt (with outstanding invoices) → SUSPENDED
 *  3. PENDING_PAYMENT subscriptions with a PENDING invoice older than 7 days → SUSPENDED
 *  4. ACTIVE subscriptions whose billingDate matches today → new MONTHLY invoice
 */
export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (!auth || auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const now        = new Date()
  const todayDay   = now.getDate()
  const sevenDaysAgo  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const startOfMonth  = new Date(now.getFullYear(), now.getMonth(), 1)

  const results = {
    processed:          0,
    invoicesCreated:    0,
    trialExpired:       0,
    gracePeriodExpired: 0,
    suspended:          0,
    errors:             [] as string[],
  }

  // ── Fetch all active/pending/trial subscriptions ──────────────────────────────
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: { in: ['TRIAL', 'ACTIVE', 'PENDING_PAYMENT'] },
    },
    include: {
      invoices: { orderBy: { createdAt: 'asc' } },
    },
  })

  results.processed = subscriptions.length

  for (const sub of subscriptions) {
    try {
      // ── 1. TRIAL past trial end → PENDING_PAYMENT + first MONTHLY invoice ──────
      if (sub.status === 'TRIAL' && sub.trialEndsAt && sub.trialEndsAt < now) {
        const monthlyPrice = getMonthlyPrice(sub.seats)
        if (monthlyPrice === null) {
          results.errors.push(
            `sub ${sub.id}: seats=${sub.seats} exceeds pricing tiers (>12,000)`,
          )
          continue
        }

        // Guard: don't double-create if a MONTHLY invoice already exists
        const hasMonthly = sub.invoices.some((inv) => inv.type === 'MONTHLY')
        if (!hasMonthly) {
          const dueDate = nextBillingDate(sub.billingDate)

          await prisma.$transaction([
            prisma.subscription.update({
              where: { id: sub.id },
              data:  { status: 'PENDING_PAYMENT' },
            }),
            prisma.invoice.create({
              data: {
                subscriptionId: sub.id,
                type:           'MONTHLY',
                amount:         monthlyPrice,
                status:         'PENDING',
                dueDate,
                notes: `First monthly invoice — trial ended ${
                  sub.trialEndsAt.toISOString().slice(0, 10)
                } — ${sub.seats} seats`,
              },
            }),
          ])

          results.trialExpired++
          results.invoicesCreated++
        } else {
          // Trial expired but MONTHLY already exists — just update status
          await prisma.subscription.update({
            where: { id: sub.id },
            data:  { status: 'PENDING_PAYMENT' },
          })
          results.trialExpired++
        }

        continue
      }

      // ── 2. ACTIVE past grace period (pending invoices outstanding) → SUSPENDED ──
      if (
        sub.status === 'ACTIVE' &&
        sub.gracePeriodEndsAt &&
        sub.gracePeriodEndsAt < now
      ) {
        const hasPending = sub.invoices.some((inv) => inv.status === 'PENDING')
        if (hasPending) {
          await prisma.$transaction([
            prisma.subscription.update({
              where: { id: sub.id },
              data:  { status: 'SUSPENDED' },
            }),
            // Mirror the license status so validate/activate routes also reject
            ...(sub.licenseId
              ? [
                  prisma.license.update({
                    where: { id: sub.licenseId },
                    data:  { status: 'SUSPENDED' },
                  }),
                ]
              : []),
          ])

          results.gracePeriodExpired++
          results.suspended++
        }

        continue
      }

      // ── 3. PENDING_PAYMENT with stale PENDING invoice (>7 days) → SUSPENDED ─────
      if (sub.status === 'PENDING_PAYMENT') {
        const hasStaleInvoice = sub.invoices.some(
          (inv) => inv.status === 'PENDING' && inv.createdAt <= sevenDaysAgo,
        )

        if (hasStaleInvoice) {
          await prisma.$transaction([
            prisma.subscription.update({
              where: { id: sub.id },
              data:  { status: 'SUSPENDED' },
            }),
            ...(sub.licenseId
              ? [
                  prisma.license.update({
                    where: { id: sub.licenseId },
                    data:  { status: 'SUSPENDED' },
                  }),
                ]
              : []),
          ])

          results.suspended++
        }

        continue
      }

      // ── 4. ACTIVE + billing day matches today → new MONTHLY invoice ───────────────
      if (sub.status === 'ACTIVE' && sub.billingDate === todayDay) {
        const monthlyPrice = getMonthlyPrice(sub.seats)
        if (monthlyPrice === null) {
          results.errors.push(
            `sub ${sub.id}: seats=${sub.seats} exceeds pricing tiers (>12,000)`,
          )
          continue
        }

        // Idempotency: skip if a MONTHLY invoice was already created this calendar month
        const alreadyBilled = sub.invoices.some(
          (inv) => inv.type === 'MONTHLY' && inv.createdAt >= startOfMonth,
        )
        if (alreadyBilled) continue

        // Due 7 days from today — reasonable payment window before grace-period logic kicks in
        const dueDate = new Date(now)
        dueDate.setDate(dueDate.getDate() + 7)

        await prisma.invoice.create({
          data: {
            subscriptionId: sub.id,
            type:           'MONTHLY',
            amount:         monthlyPrice,
            status:         'PENDING',
            dueDate,
            notes: `Monthly charge — ${now.toLocaleDateString('pt-BR', {
              month: 'long',
              year:  'numeric',
            })} — ${sub.seats} seats`,
          },
        })

        results.invoicesCreated++
      }
    } catch (err) {
      results.errors.push(
        `sub ${sub.id}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
