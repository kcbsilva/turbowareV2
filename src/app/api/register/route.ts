import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { turboISPQuery } from '@/lib/turboisp-db'
import { parseBody, badRequest } from '@/lib/api'

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '')
}

// POST /api/register — public signup that creates a pending client record,
// provisions a TurboISP tenant + admin user, and starts a 14-day trial.
export async function POST(req: NextRequest) {
  const { body: parsed, error } = await parseBody(req)
  if (error) return badRequest()
  const {
    firstName, lastName, cpf, phone,
    cnpj, tradeName, legalName, openingDate, fullAddress,
    financialEmail, technicalEmail,
    ddns, ddnsUsername, ddnsPassword,
    password, product, message, internalNotes,
    recaptchaToken, acceptedTerms,
  } = parsed as Record<string, string>

  const name  = `${firstName || ''} ${lastName || ''}`.trim()
  const email = financialEmail || technicalEmail
  const slug  = ddns ? normalize(ddns) : null

  // ── Validation ─────────────────────────────────────────────────────────────
  if (!firstName?.trim() || !lastName?.trim())
    return NextResponse.json({ error: 'Nome e sobrenome são obrigatórios.' }, { status: 400 })
  if (!email?.trim())
    return NextResponse.json({ error: 'Email financeiro é obrigatório.' }, { status: 400 })
  if (!ddnsPassword?.trim() && !password?.trim())
    return NextResponse.json({ error: 'A senha é obrigatória.' }, { status: 400 })
  if (!acceptedTerms)
    return NextResponse.json({ error: 'Você precisa concordar com os Termos de Serviços.' }, { status: 400 })

  const finalPassword = ddnsPassword || password

  // ── Duplicate checks ───────────────────────────────────────────────────────
  const existing = await prisma.client.findFirst({
    where: { email: { equals: email.trim(), mode: 'insensitive' } },
  })
  if (existing)
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })

  const normalizedCnpj = cnpj ? cnpj.replace(/\D/g, '') : null
  if (normalizedCnpj) {
    const existingCnpj = await prisma.client.findUnique({ where: { cnpj: normalizedCnpj } })
    if (existingCnpj)
      return NextResponse.json({ error: 'An account with this CNPJ already exists.' }, { status: 409 })
  }

  if (slug) {
    const existingSubdomain = await prisma.client.findFirst({ where: { subdomain: slug } })
    if (existingSubdomain)
      return NextResponse.json({ error: 'Este subdomínio já está em uso.' }, { status: 409 })
  }

  // ── Create Turboware client ────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(finalPassword, 12)
  const notes = [
    internalNotes?.trim() || null,
    product   ? `Product interest: ${product.trim()}` : null,
    message   ? `Message: ${message.trim()}` : null,
    cpf       ? `CPF: ${cpf.trim()}` : null,
    tradeName ? `Nome Fantasia: ${tradeName.trim()}` : null,
    legalName ? `Razão Social: ${legalName.trim()}` : null,
    openingDate  ? `Data de abertura: ${openingDate}` : null,
    fullAddress  ? `Endereço completo: ${fullAddress.trim()}` : null,
    technicalEmail ? `Email técnico: ${technicalEmail.trim()}` : null,
    ddns         ? `DDNS: ${slug}` : null,
    ddnsUsername ? `DDNS username: ${ddnsUsername.trim()}` : null,
    recaptchaToken ? `reCAPTCHA token present` : null,
    `Registered via: /register`,
    `Registered on: ${new Date().toISOString()}`,
  ].filter(Boolean).join('\n')

  const client = await prisma.client.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      company: tradeName?.trim() || legalName?.trim() || null,
      cnpj: normalizedCnpj,
      password: passwordHash,
      internalNotes: notes,
      subdomain: slug || undefined,
    },
  })

  // ── TurboISP provisioning (only when a subdomain was chosen) ───────────────
  if (slug) {
    let tenantId: string | null = null

    try {
      // Step A — create tenant row
      const tenantResult = await turboISPQuery<{ id: string }>(
        `INSERT INTO tenants (slug, name, status, created_at, updated_at)
         VALUES ($1, $2, 'active', NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING
         RETURNING id`,
        [slug, tradeName?.trim() || legalName?.trim() || name],
      )

      if (tenantResult.rows.length === 0) {
        // Slug already taken in TurboISP DB — clean up and return 409
        await prisma.client.delete({ where: { id: client.id } })
        return NextResponse.json({ error: 'Este subdomínio já está em uso no TurboISP.' }, { status: 409 })
      }

      tenantId = tenantResult.rows[0].id

      // Step B — create admin user for the tenant
      const adminHash = await bcrypt.hash(finalPassword, 12)
      await turboISPQuery(
        `INSERT INTO system_users (tenant_id, username, full_name, password_hash, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'owner', NOW(), NOW())`,
        [tenantId, ddnsUsername?.trim() || email.trim(), name, adminHash],
      )
    } catch (err) {
      // Roll back tenant if admin user creation fails
      if (tenantId) {
        await turboISPQuery(`DELETE FROM tenants WHERE id = $1`, [tenantId]).catch(() => null)
      }
      console.error('[register] TurboISP provisioning failed:', err)
      // Don't block registration — client record stays as a lead, admin can reprovision manually
    }

    // Step C — create 14-day trial subscription in Turboware
    try {
      await prisma.subscription.create({
        data: {
          clientId: client.id,
          product: 'TurboISP',
          seats: 0,
          status: 'TRIAL',
          billingDate: 1,
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          region: 'BR',
        },
      })
    } catch (err) {
      console.error('[register] Subscription creation failed:', err)
      // Non-fatal — admin can create subscription manually
    }
  }

  return NextResponse.json({ ok: true, id: client.id }, { status: 201 })
}
