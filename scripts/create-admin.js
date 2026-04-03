#!/usr/bin/env node

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TurbowareV2 — Create Admin User Script
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Creates a named admin user in the `admin_users` database table.
 * Passwords are hashed with bcryptjs before storage.
 *
 * USAGE:
 *   node scripts/create-admin.js --name "Kevin" --email "you@example.com" --password "secret"
 *
 * OPTIONS:
 *   --name     Display name for the admin (required)
 *   --email    Login email address (required, must be unique)
 *   --password Plaintext password — will be hashed before storage (required)
 *   --role     Optional role string (default: "admin")
 *
 * PREREQUISITES:
 *   DATABASE_URL must be set in .env (uses dotenv to load it automatically)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict'

const path    = require('path')
const bcrypt  = require('bcryptjs')

// Load .env so DATABASE_URL is available without the user having to export it
// (inline loader — avoids dotenv dependency)
const fs = require('fs')
const envPath = path.resolve(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = val
  }
}

// Prisma client — instantiated after dotenv so DATABASE_URL is set
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ── Parse CLI args ─────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2)
  const result = { name: null, email: null, password: null, role: 'admin' }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--name':     result.name     = args[++i]; break
      case '--email':    result.email    = args[++i]; break
      case '--password': result.password = args[++i]; break
      case '--role':     result.role     = args[++i]; break
    }
  }

  return result
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔐  TurbowareV2 — Create Admin User\n')

  const { name, email, password, role } = parseArgs()

  // Validate
  const missing = []
  if (!name)     missing.push('--name')
  if (!email)    missing.push('--email')
  if (!password) missing.push('--password')

  if (missing.length > 0) {
    console.error(`❌  Missing required arguments: ${missing.join(', ')}`)
    console.error('\nUsage:')
    console.error('  node scripts/create-admin.js --name "Kevin" --email "you@example.com" --password "secret"\n')
    process.exit(1)
  }

  if (password.length < 8) {
    console.warn('⚠️   Warning: password is less than 8 characters. Consider a stronger password.')
  }

  // Hash password
  const SALT_ROUNDS = 12
  console.log('🔒  Hashing password...')
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  // Insert into DB
  console.log(`📧  Creating admin user: ${email}`)
  const user = await prisma.adminUser.create({
    data: { name, email, passwordHash, role },
  })

  console.log('\n✅  Admin user created successfully!')
  console.log(`  ID:    ${user.id}`)
  console.log(`  Name:  ${user.name}`)
  console.log(`  Email: ${user.email}`)
  console.log(`  Role:  ${user.role}`)
  console.log('\nLogin at /admin/login using your email and password.\n')
}

main()
  .catch((err) => {
    if (err.code === 'P2002') {
      console.error(`❌  An admin user with that email already exists.`)
    } else {
      console.error('❌  Unexpected error:', err.message)
    }
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
