import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// POST /api/register — public signup that creates a pending client record
export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    firstName,
    lastName,
    cpf,
    phone,
    cnpj,
    tradeName,
    legalName,
    openingDate,
    fullAddress,
    financialEmail,
    technicalEmail,
    ddns,
    ddnsUsername,
    ddnsPassword,
    password,
    product,
    message,
    internalNotes,
    recaptchaToken,
    acceptedTerms,
  } = body

  const name = `${firstName || ''} ${lastName || ''}`.trim()
  const email = financialEmail || technicalEmail

  if (!firstName?.trim() || !lastName?.trim()) {
    return NextResponse.json({ error: 'Nome e sobrenome são obrigatórios.' }, { status: 400 })
  }
  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email financeiro é obrigatório.' }, { status: 400 })
  }
  if (!ddnsPassword?.trim() && !password?.trim()) {
    return NextResponse.json({ error: 'A senha é obrigatória.' }, { status: 400 })
  }
  if (!acceptedTerms) {
    return NextResponse.json({ error: 'Você precisa concordar com os Termos de Serviços.' }, { status: 400 })
  }

  const finalPassword = ddnsPassword || password

  // Check for duplicate email
  const existing = await prisma.client.findFirst({
    where: { email: { equals: email.trim(), mode: 'insensitive' } },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'An account with this email already exists. Contact support if you need help.' },
      { status: 409 },
    )
  }

  // Check for duplicate CNPJ if provided
  const normalizedCnpj = cnpj ? cnpj.replace(/\D/g, '') : null
  if (normalizedCnpj) {
    const existingCnpj = await prisma.client.findUnique({ where: { cnpj: normalizedCnpj } })
    if (existingCnpj) {
      return NextResponse.json(
        { error: 'An account with this CNPJ already exists.' },
        { status: 409 },
      )
    }
  }

  const passwordHash = await bcrypt.hash(finalPassword, 12)
  const notes = [
    internalNotes?.trim() || null,
    product ? `Product interest: ${product.trim()}` : null,
    message ? `Message: ${message.trim()}` : null,
    cpf ? `CPF: ${cpf.trim()}` : null,
    tradeName ? `Nome Fantasia: ${tradeName.trim()}` : null,
    legalName ? `Razão Social: ${legalName.trim()}` : null,
    openingDate ? `Data de abertura: ${openingDate}` : null,
    fullAddress ? `Endereço completo: ${fullAddress.trim()}` : null,
    technicalEmail ? `Email técnico: ${technicalEmail.trim()}` : null,
    ddns ? `DDNS: ${ddns.trim()}` : null,
    ddnsUsername ? `DDNS username: ${ddnsUsername.trim()}` : null,
    recaptchaToken ? `reCAPTCHA token present` : null,
    `Registered via: /register`,
    `Registered on: ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join('\n')

  const client = await prisma.client.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      company: tradeName?.trim() || legalName?.trim() || null,
      cnpj: normalizedCnpj,
      password: passwordHash,
      internalNotes: notes,
    },
  })

  return NextResponse.json({ ok: true, id: client.id }, { status: 201 })
}
