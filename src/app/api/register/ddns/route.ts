// src/app/api/register/ddns/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DO_API_TOKEN = process.env.DO_API_TOKEN!
const DO_DOMAIN = process.env.DO_DOMAIN! // e.g. turboisp.app
const MAIN_VPS_IP = process.env.MAIN_VPS_IP! // your DO droplet public IP

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63) // DNS label max length
}

// Reserved subdomains — never allow these
const RESERVED = new Set([
  'www', 'api', 'admin', 'mail', 'smtp', 'ftp',
  'app', 'dev', 'staging', 'beta', 'portal',
  'turboisp', 'turboware', 'support', 'billing',
])

// ─── GET /api/register/ddns?name=xyz ─────────────────────────────────────────
// Check if a subdomain is available
export async function GET(req: NextRequest) {
  const name = normalize(req.nextUrl.searchParams.get('name') || '')

  if (!name || name.length < 3) {
    return NextResponse.json(
      { available: false, error: 'Nome deve ter pelo menos 3 caracteres.' },
      { status: 400 }
    )
  }

  if (RESERVED.has(name)) {
    return NextResponse.json({
      available: false,
      error: 'Este subdomínio é reservado.',
    })
  }

  // Check against dedicated subdomain field (not fuzzy company name)
  const existing = await prisma.client.findFirst({
    where: { subdomain: name },
    select: { id: true },
  })

  if (existing) {
    return NextResponse.json({
      available: false,
      error: 'Este subdomínio já está em uso.',
    })
  }

  return NextResponse.json({
    available: true,
    subdomain: name,
    fqdn: `${name}.${DO_DOMAIN}`,
    message: `${name}.${DO_DOMAIN} está disponível.`,
  })
}

// ─── POST /api/register/ddns ──────────────────────────────────────────────────
// Claim subdomain → create DO DNS record → save to client
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { clientId, subdomain } = body

  if (!clientId || !subdomain) {
    return NextResponse.json(
      { error: 'clientId e subdomain são obrigatórios.' },
      { status: 400 }
    )
  }

  const name = normalize(subdomain)

  if (!name || name.length < 3) {
    return NextResponse.json(
      { error: 'Subdomínio inválido.' },
      { status: 400 }
    )
  }

  if (RESERVED.has(name)) {
    return NextResponse.json(
      { error: 'Este subdomínio é reservado.' },
      { status: 400 }
    )
  }

  // Verify client exists
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, subdomain: true },
  })

  if (!client) {
    return NextResponse.json(
      { error: 'Cliente não encontrado.' },
      { status: 404 }
    )
  }

  if (client.subdomain) {
    return NextResponse.json(
      { error: 'Este cliente já possui um subdomínio registrado.' },
      { status: 409 }
    )
  }

  // Re-check availability inside transaction window
  const conflict = await prisma.client.findFirst({
    where: { subdomain: name },
    select: { id: true },
  })

  if (conflict) {
    return NextResponse.json(
      { error: 'Subdomínio já foi registrado por outro cliente.' },
      { status: 409 }
    )
  }

  // Create DNS A record on DigitalOcean
  const doRecord = await createDODNSRecord(name)

  if (!doRecord.success) {
    return NextResponse.json(
      { error: `Falha ao registrar DNS: ${doRecord.error}` },
      { status: 502 }
    )
  }

  // Save subdomain + DO record ID to client
  await prisma.client.update({
    where: { id: clientId },
    data: {
      subdomain: name,
      dnsRecordId: String(doRecord.recordId), // store for future deletion
    },
  })

  return NextResponse.json({
    success: true,
    subdomain: name,
    fqdn: `${name}.${DO_DOMAIN}`,
    dnsRecordId: doRecord.recordId,
  })
}

// ─── DigitalOcean DNS Helper ──────────────────────────────────────────────────
async function createDODNSRecord(
  subdomain: string
): Promise<{ success: boolean; recordId?: number; error?: string }> {
  try {
    const res = await fetch(
      `https://api.digitalocean.com/v2/domains/${DO_DOMAIN}/records`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${DO_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'A',
          name: subdomain,       // DO uses just the subdomain label, not FQDN
          data: MAIN_VPS_IP,     // points to your main TurboISP VPS
          ttl: 300,              // 5 min TTL — low for fast propagation on signup
        }),
      }
    )

    if (!res.ok) {
      const err = await res.json()
      return {
        success: false,
        error: err.message || `DO API error ${res.status}`,
      }
    }

    const data = await res.json()
    return {
      success: true,
      recordId: data.domain_record.id,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}