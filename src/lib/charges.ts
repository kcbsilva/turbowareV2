import { InvoiceType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const CHARGE_TYPES = ['INSTALLATION', 'IMPORTATION', 'CUSTOM'] as const
export type ChargeType = (typeof CHARGE_TYPES)[number]

const MAX_INSTALLMENTS = 12

export function splitInstallments(total: number, count: number): number[] {
  const n = Math.floor(count)
  if (!Number.isFinite(total) || total <= 0) return []
  if (!Number.isFinite(n) || n < 1) return []
  const cents = Math.round(total * 100)
  const base = Math.floor(cents / n)
  const rem = cents - base * n
  return Array.from({ length: n }, (_, i) => (base + (i === n - 1 ? rem : 0)) / 100)
}

export function addIntervalDays(from: Date, days: number): Date {
  const next = new Date(from.getTime())
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function parseDueDate(raw: string): Date | null {
  const trimmed = raw.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null
  const d = new Date(`${trimmed}T12:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

export async function createAdHocCharge(opts: {
  clientId: string
  type: ChargeType
  amount: number
  dueDate: string
  notes?: string
  installments?: number
  intervalDays?: number
}) {
  const type = opts.type
  if (!CHARGE_TYPES.includes(type)) {
    return { error: 'Invalid charge type', status: 400 as const }
  }

  const amount = Number(opts.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'Amount must be greater than zero', status: 400 as const }
  }

  const firstDue = parseDueDate(opts.dueDate)
  if (!firstDue) return { error: 'Due date is required (YYYY-MM-DD)', status: 400 as const }

  const installments = Math.floor(opts.installments ?? 1)
  if (installments < 1 || installments > MAX_INSTALLMENTS) {
    return { error: `Installments must be between 1 and ${MAX_INSTALLMENTS}`, status: 400 as const }
  }

  const intervalDays = Math.floor(opts.intervalDays ?? 30)
  if (installments > 1 && (intervalDays < 1 || intervalDays > 90)) {
    return { error: 'Interval must be between 1 and 90 days', status: 400 as const }
  }

  const sub = await prisma.subscription.findUnique({
    where: { clientId: opts.clientId },
    select: { id: true, paymentPlanAllowed: true },
  })
  if (!sub) return { error: 'No subscription for this client', status: 404 as const }

  if (installments > 1 && !sub.paymentPlanAllowed) {
    return { error: 'Payment plans are not allowed for this client', status: 403 as const }
  }

  const notes = opts.notes?.trim() || null
  const parts = splitInstallments(amount, installments)
  const invoiceType = type as InvoiceType

  const invoices = await prisma.$transaction(async (tx) => {
    let planId: string | null = null
    if (installments > 1) {
      const plan = await tx.paymentPlan.create({
        data: {
          subscriptionId: sub.id,
          totalAmount: amount,
          installmentCount: installments,
          intervalDays,
          notes,
        },
        select: { id: true },
      })
      planId = plan.id
    }

    const created = []
    for (let i = 0; i < parts.length; i++) {
      const dueDate = addIntervalDays(firstDue, intervalDays * i)
      const installmentNote =
        installments > 1
          ? [notes, `Installment ${i + 1}/${installments}`].filter(Boolean).join(' — ')
          : notes
      created.push(
        await tx.invoice.create({
          data: {
            subscriptionId: sub.id,
            type: invoiceType,
            amount: parts[i],
            dueDate,
            notes: installmentNote,
            paymentPlanId: planId,
            installmentNo: installments > 1 ? i + 1 : null,
          },
        }),
      )
    }
    return created
  })

  return { invoices }
}
