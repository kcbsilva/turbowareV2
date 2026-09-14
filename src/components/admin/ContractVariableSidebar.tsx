'use client'

import type { MsgKey } from '@/lib/admin-i18n'
import {
  CLIENT_CONTRACT_FIELDS,
  CONTRACT_VARIABLES,
  PROVIDER_CONTRACT_FIELDS,
  tokenFor,
} from '@/lib/contract-variables'
import { useAdminLang } from '@/components/admin/AdminLangProvider'

const CLIENT_KEYS = [
  'client.name',
  'client.company',
  'client.email',
  'client.phone',
  'client.cnpj',
  'client.subdomain',
] as const

const CONTRACT_KEYS = [
  'contract.title',
  'contract.number',
  'contract.startsAt',
  'effective_date',
  'today',
] as const

const GROUPS: { id: string; labelKey: MsgKey; keys: readonly string[] }[] = [
  { id: 'client', labelKey: 'terms.group.client', keys: CLIENT_KEYS },
  { id: 'contract', labelKey: 'terms.group.contract', keys: CONTRACT_KEYS },
  { id: 'provider', labelKey: 'terms.group.provider', keys: PROVIDER_CONTRACT_FIELDS.map((field) => field.key) },
  { id: 'party', labelKey: 'terms.group.party', keys: CLIENT_CONTRACT_FIELDS.filter((field) => field.group === 'party').map((field) => field.key) },
  { id: 'fees', labelKey: 'terms.group.fees', keys: CLIENT_CONTRACT_FIELDS.filter((field) => field.group === 'fees').map((field) => field.key) },
  { id: 'sla', labelKey: 'terms.group.sla', keys: CLIENT_CONTRACT_FIELDS.filter((field) => field.group === 'sla').map((field) => field.key) },
  { id: 'law', labelKey: 'terms.group.law', keys: [...CLIENT_CONTRACT_FIELDS.filter((field) => field.group === 'law').map((field) => field.key), 'signing_place_date'] },
]

const LABEL_BY_KEY = Object.fromEntries(
  CONTRACT_VARIABLES.map((variable) => [variable.key, variable.labelKey]),
) as Record<string, MsgKey>

interface Props {
  onInsert: (key: string) => void
}

export function ContractVariableSidebar({ onInsert }: Props) {
  const { t } = useAdminLang()

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-md border border-border bg-muted/30">
      <div className="shrink-0 border-b border-border px-3 py-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
          {t('templates.variables')}
        </h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{t('templates.varHint')}</p>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2">
        {GROUPS.map((group) => (
          <div key={group.id}>
            <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t(group.labelKey)}
            </p>
            <div className="space-y-1">
              {group.keys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onInsert(key)}
                  className="block w-full rounded-md border border-transparent px-2 py-1.5 text-left hover:border-border hover:bg-background"
                  title={t(LABEL_BY_KEY[key])}
                >
                  <span className="block font-mono text-[10px] text-foreground">{tokenFor(key)}</span>
                  <span className="block text-[10px] text-muted-foreground">{t(LABEL_BY_KEY[key])}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
