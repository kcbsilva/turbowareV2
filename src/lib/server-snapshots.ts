export const SERVERS = [
  { id: 'turbovpn', name: 'TurboVPN', repositories: ['TurboVPN', 'TurboRADIUS'] },
  { id: 'turboisp-api', name: 'TurboISP-API', repositories: ['TurboISP-API'] },
] as const

export const GIT_STATES = ['synced', 'different', 'unavailable'] as const
const METRICS = ['cpuPercent', 'cpuCount', 'ramUsed', 'ramTotal', 'diskUsed', 'diskTotal', 'uptimeSeconds'] as const

type RepositorySnapshot = {
  name: string
  head: string | null
  upstream: string | null
  ref: string | null
  dirty: boolean | null
}

type ServerSnapshot = Record<(typeof METRICS)[number], number> & {
  repositories: RepositorySnapshot[]
}

export type ServerReading = {
  id: string
  receivedAt: string
  stale: boolean
  snapshot: ServerSnapshot
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function commit(value: unknown): value is string | null {
  return value === null || (typeof value === 'string' && /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(value))
}

export function parseServerSnapshot(value: unknown, names: readonly string[]): ServerSnapshot | null {
  if (!record(value)) return null

  const metrics = Object.fromEntries(METRICS.map((key) => [key, value[key]]))
  if (!Object.values(metrics).every((metric) => typeof metric === 'number' && Number.isFinite(metric) && metric >= 0)) {
    return null
  }
  const readings = metrics as Record<(typeof METRICS)[number], number>
  if (readings.cpuPercent > 100 || readings.cpuCount < 1 || !Number.isInteger(readings.cpuCount) ||
    readings.ramTotal < 1 || readings.ramUsed > readings.ramTotal ||
    readings.diskTotal < 1 || readings.diskUsed > readings.diskTotal) return null

  const rawRepositories: unknown = value.repositories
  if (!Array.isArray(rawRepositories) || rawRepositories.length !== names.length) return null
  const repositories: RepositorySnapshot[] = []
  for (const name of names) {
    const repo: unknown = rawRepositories.find((entry) => record(entry) && entry.name === name)
    if (!record(repo) || !commit(repo.head) || !commit(repo.upstream) ||
      !(repo.ref === null || (typeof repo.ref === 'string' && repo.ref.startsWith('refs/heads/') && repo.ref.length <= 255)) ||
      !(repo.dirty === null || typeof repo.dirty === 'boolean')) return null
    repositories.push({ name, head: repo.head, upstream: repo.upstream, ref: repo.ref, dirty: repo.dirty })
  }
  return { ...readings, repositories }
}

export function gitState(repo: RepositorySnapshot): (typeof GIT_STATES)[number] {
  if (!repo.head || !repo.upstream) return 'unavailable'
  return repo.head === repo.upstream ? 'synced' : 'different'
}
