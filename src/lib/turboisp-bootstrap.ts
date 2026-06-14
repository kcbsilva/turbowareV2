import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import type { PoolClient } from 'pg'
import { getTurboISPPool } from '@/lib/turboisp-db'
import { isValidSignupSlug, normalizeSignupSlug, staffLoginUrl } from '@/lib/signup-slug'

export type TurboISPBootstrapInput = {
  name: string
  slug: string
  adminUsername: string
  adminEmail: string
  adminPassword: string
  countryCode: string
  currency: string
}

export type TurboISPBootstrapResult = {
  tenantId: string
  slug: string
  adminUsername: string
  staffLoginUrl: string
}

function mapUserError(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('idx_system_users_tenant_username') || msg.includes('username')) {
    return new Error('username already in use')
  }
  if (msg.includes('idx_system_users_tenant_email') || msg.includes('email')) {
    return new Error('email already in use')
  }
  if (msg.includes('23505')) {
    if (msg.toLowerCase().includes('username')) return new Error('username already in use')
    if (msg.toLowerCase().includes('email')) return new Error('email already in use')
  }
  return err instanceof Error ? err : new Error(msg)
}

async function bootstrapInTransaction(
  client: PoolClient,
  in_: TurboISPBootstrapInput,
): Promise<TurboISPBootstrapResult> {
  const name = in_.name.trim()
  const slug = normalizeSignupSlug(in_.slug)
  if (!name) throw new Error('company name required')
  if (!isValidSignupSlug(slug)) throw new Error('invalid slug')

  let adminUser = in_.adminUsername.trim()
  if (!adminUser) adminUser = `${slug}.admin`

  let adminEmail = in_.adminEmail.trim()
  if (!adminEmail) adminEmail = `${adminUser}@${slug}.local`

  const country = (in_.countryCode.trim() || 'US').toUpperCase()
  const currency = (in_.currency.trim() || 'USD').toUpperCase()

  const taken = await client.query<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM tenants WHERE slug = $1) AS exists`,
    [slug],
  )
  if (taken.rows[0]?.exists) throw new Error('slug already in use')

  const hash = await bcrypt.hash(in_.adminPassword, 10)
  const tenantId = randomUUID()

  await client.query(
    `INSERT INTO tenants (id, name, slug, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())`,
    [tenantId, name, slug],
  )

  const group = await client.query<{ id: string }>(
    `SELECT id::text FROM acl_groups
     WHERE name = 'Administrators' AND COALESCE(is_archived, false) = false
     ORDER BY id LIMIT 1`,
  )
  const groupId = group.rows[0]?.id
  if (!groupId) throw new Error('administrators group not found')

  try {
    await client.query(
      `INSERT INTO system_users (
         full_name, username, email, password, group_id, status, tenant_id, is_archived, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, 'active', $6, false, NOW(), NOW())`,
      [`${name} Admin`, adminUser, adminEmail, hash, groupId, tenantId],
    )
  } catch (err) {
    throw mapUserError(err)
  }

  await client.query(
    `INSERT INTO plans (tenant_id, name, price, bandwidth, billing_cycle, service_type, created_at, updated_at)
     VALUES ($1, '100 Mbps Fiber', 49.90, '100 Mbps', 'monthly', 'internet', NOW(), NOW())`,
    [tenantId],
  )

  const globalJSON = JSON.stringify({
    companyName: name,
    defaultCountryCode: country,
    defaultCurrency: currency,
  })

  await client.query(
    `INSERT INTO tenant_settings (tenant_id, setting_key, value, type, created_at, updated_at)
     VALUES ($1, 'global_settings', $2::jsonb, 'json', NOW(), NOW())
     ON CONFLICT (tenant_id, setting_key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [tenantId, globalJSON],
  )

  await client.query(
    `INSERT INTO dunning_policies (tenant_id, name, days_overdue, action, channel, message_template, is_active)
     SELECT $1, 'Payment reminder (7 days)', 7, 'remind', 'email',
       'Hi {{name}}, invoice #{{invoice_id}} for {{amount}} is overdue (due {{due_date}}). Please pay via the customer portal.',
       true
     WHERE NOT EXISTS (
       SELECT 1 FROM dunning_policies WHERE tenant_id = $1 AND name = 'Payment reminder (7 days)'
     )`,
    [tenantId],
  )

  return {
    tenantId,
    slug,
    adminUsername: adminUser,
    staffLoginUrl: staffLoginUrl(slug),
  }
}

export async function createTurboISPTenant(
  input: TurboISPBootstrapInput,
): Promise<TurboISPBootstrapResult> {
  const pool = getTurboISPPool()
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await bootstrapInTransaction(client, input)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

function quoteIdent(name: string): string {
  if (!/^[a-z_][a-z0-9_]*$/i.test(name)) {
    throw new Error(`invalid table name: ${name}`)
  }
  return `"${name}"`
}

/** Clear cross-table FKs that block tenant-scoped deletes (not keyed by tenant_id on the parent). */
async function detachTenantDeleteBlockers(client: PoolClient, tenantId: string): Promise<void> {
  await client.query(
    `UPDATE projects SET company_id = NULL WHERE tenant_id = $1 AND company_id IS NOT NULL`,
    [tenantId],
  )
}

async function deleteTenantRowsFromTable(
  client: PoolClient,
  tableName: string,
  tenantId: string,
): Promise<number> {
  const savepoint = `sp_${tableName.replace(/[^a-z0-9_]/gi, '_')}`
  await client.query(`SAVEPOINT ${savepoint}`)
  try {
    const result = await client.query(
      `DELETE FROM ${quoteIdent(tableName)} WHERE tenant_id = $1`,
      [tenantId],
    )
    await client.query(`RELEASE SAVEPOINT ${savepoint}`)
    return result.rowCount ?? 0
  } catch {
    await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`)
    await client.query(`RELEASE SAVEPOINT ${savepoint}`)
    return 0
  }
}

/** Delete tenant row and all public rows keyed by tenant_id (FK-safe multi-pass). */
async function purgeTurboISPTenantById(client: PoolClient, tenantId: string): Promise<void> {
  await detachTenantDeleteBlockers(client, tenantId)

  const { rows: tables } = await client.query<{ table_name: string }>(
    `SELECT DISTINCT c.table_name
     FROM information_schema.columns c
     INNER JOIN information_schema.tables t
       ON t.table_schema = c.table_schema AND t.table_name = c.table_name
     WHERE c.table_schema = 'public'
       AND c.column_name = 'tenant_id'
       AND t.table_type = 'BASE TABLE'
       AND c.table_name <> 'tenants'
     ORDER BY c.table_name`,
  )

  const MAX_PASSES = 32
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let deletedAny = false
    for (const { table_name } of tables) {
      const n = await deleteTenantRowsFromTable(client, table_name, tenantId)
      if (n > 0) deletedAny = true
    }
    if (!deletedAny) break
  }

  for (const { table_name } of tables) {
    const check = await client.query(
      `SELECT 1 FROM ${quoteIdent(table_name)} WHERE tenant_id = $1 LIMIT 1`,
      [tenantId],
    )
    if ((check.rowCount ?? 0) > 0) {
      throw new Error(
        `tenant delete blocked: rows remain in ${table_name} (foreign key ordering)`,
      )
    }
  }

  const del = await client.query(`DELETE FROM tenants WHERE id = $1`, [tenantId])
  if ((del.rowCount ?? 0) === 0) {
    throw new Error('tenant delete blocked by remaining foreign keys')
  }
}

export async function deleteTurboISPTenant(tenantId: string): Promise<void> {
  const pool = getTurboISPPool()
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await purgeTurboISPTenantById(client, tenantId)
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

/** Remove TurboISP tenant by slug (used when deleting a linked billing client). */
export async function deleteTurboISPTenantBySlug(slug: string): Promise<void> {
  const normalized = normalizeSignupSlug(slug)
  if (!normalized) return

  const pool = getTurboISPPool()
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const found = await client.query<{ id: string }>(
      `SELECT id::text FROM tenants WHERE slug = $1`,
      [normalized],
    )
    if (found.rowCount === 0) {
      await client.query('COMMIT')
      return
    }
    await purgeTurboISPTenantById(client, found.rows[0].id)
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
