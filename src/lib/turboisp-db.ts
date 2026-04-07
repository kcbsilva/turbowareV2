/**
 * Singleton pg.Pool for TurboISP's Supabase instance.
 * Used by registration to provision tenants and system users.
 */
import { Pool } from 'pg'

function createPool(): Pool {
  const url = process.env.TURBOISP_DATABASE_URL
  if (!url) throw new Error('TURBOISP_DATABASE_URL is not set')
  return new Pool({ connectionString: url, max: 3 })
}

// Module-level singleton (safe in serverless — one pool per cold start)
let _pool: Pool | null = null
export function getTurboISPPool(): Pool {
  if (!_pool) _pool = createPool()
  return _pool
}

export async function turboISPQuery<T extends object = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<import('pg').QueryResult<T>> {
  return getTurboISPPool().query<T>(text, params)
}
