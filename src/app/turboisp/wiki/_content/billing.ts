import type { Article } from './types'
import { t, trail } from './helpers'

const turbo = ['TurboMenu'] as const

export const billingFiscal: Article[] = [
  {
    slug: 'payment-gateways',
    category: 'billing',
    minutes: 6,
    title: t('Turn on a payment gateway', 'Ligar um gateway de pagamento', 'Activer une passerelle de paiement'),
    summary: t(
      'ASAAS, EFI, Stripe, PayPal — credentials live on the tenant, not in a shared platform key.',
      'ASAAS, EFI, Stripe, PayPal — credenciais no tenant, não numa chave de plataforma compartilhada.',
      'ASAAS, EFI, Stripe, PayPal — identifiants sur le tenant, pas une clé plateforme partagée.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'Financials', 'Gateways'],
        [...turbo, 'Configurações', 'Financeiro', 'Gateways'],
        [...turbo, 'Paramètres', 'Finances', 'Passerelles'],
      ) },
      { type: 'steps', items: [
        { title: t('Pick the provider this POP actually uses', 'Escolha o provedor que este POP usa', 'Choisissez le prestataire que ce POP utilise'), body: t(
          'Brazil tenants typically start with ASAAS or EFI. Canada Interac on launch is recorded as a manual settlement — not a live PSP click.',
          'Tenants Brasil em geral começam com ASAAS ou EFI. Interac no Canadá, no lançamento, é liquidação manual — não um clique de PSP ao vivo.',
          'Les tenants Brésil commencent souvent par ASAAS ou EFI. Interac Canada au lancement = règlement manuel — pas un clic PSP live.',
        ) },
        { title: t('Save wallets too', 'Salve as carteiras também', 'Enregistrez aussi les wallets'), body: t(
          'Settings → Financials → Wallets. Cashbook entries need a wallet even when the gateway is online.',
          'Configurações → Financeiro → Carteiras. Lançamentos de caixa precisam de carteira mesmo com gateway online.',
          'Paramètres → Finances → Wallets. Les écritures de caisse ont besoin d’un wallet même si la passerelle est en ligne.',
        ) },
      ] },
      { type: 'related', slugs: ['generate-invoices', 'dunning'] },
    ],
  },
  {
    slug: 'generate-invoices',
    category: 'billing',
    minutes: 8,
    title: t('Generate invoices in bulk', 'Gerar faturas em lote', 'Générer les factures en lot'),
    summary: t(
      'Monthly titles from active contracts. Bulk generate is an admin action.',
      'Títulos do mês a partir de contratos ativos. Gerar em lote é ação de admin.',
      'Titres du mois depuis les contrats actifs. La génération en masse est une action admin.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Finances', 'Invoices'],
        [...turbo, 'Finanças', 'Faturas'],
        [...turbo, 'Finances', 'Factures'],
      ) },
      { type: 'steps', items: [
        { title: t('Confirm due dates and plans first', 'Confirme vencimentos e planos antes', 'Confirmez échéances et forfaits d’abord'), body: t(
          'Wrong plan price reproduces on every invoice. Fix the plan, then generate — do not hand-edit a thousand rows.',
          'Preço de plano errado se reproduz em toda fatura. Corrija o plano e gere — não edite mil linhas na mão.',
          'Un mauvais prix de forfait se recopie sur chaque facture. Corrigez le forfait, puis générez — n’éditez pas mille lignes à la main.',
        ) },
        { title: t('Run generate', 'Rode a geração', 'Lancez la génération'), body: t(
          'Bulk POST is admin-only. After it finishes, spot-check a known customer and the cashbook.',
          'O POST em lote é só admin. Depois, cheque um cliente conhecido e o livro caixa.',
          'Le POST de masse est admin-only. Ensuite, vérifiez un client connu et le livre de caisse.',
        ) },
      ] },
      { type: 'related', slugs: ['dunning', 'carnes', 'cnab'] },
    ],
  },
  {
    slug: 'dunning',
    category: 'billing',
    minutes: 6,
    title: t('Dunning, suspend, restore', 'Cobrança, suspender, restaurar', 'Relance, suspendre, rétablir'),
    summary: t(
      'Reminders, then suspension, then restore when the invoice clears.',
      'Lembretes, depois suspensão, depois restauração quando a fatura quita.',
      'Rappels, puis suspension, puis rétablissement quand la facture est soldée.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Finances', 'Dunning'],
        [...turbo, 'Finanças', 'Cobrança'],
        [...turbo, 'Finances', 'Relance'],
      ) },
      { type: 'p', text: t(
        'SMS-shaped dunning on launch goes out over WhatsApp Cloud, not a separate SMS vendor. Keep messages transactional.',
        'Dunning com cara de SMS no lançamento sai pelo WhatsApp Cloud, não por um SMS separado. Mantenha as mensagens transacionais.',
        'La relance type SMS au lancement part via WhatsApp Cloud, pas un SMS séparé. Gardez les messages transactionnels.',
      ) },
      { type: 'related', slugs: ['generate-invoices', 'email-whatsapp', 'disconnect-session'] },
    ],
  },
  {
    slug: 'cnab',
    category: 'billing',
    minutes: 6,
    title: t('CNAB remittance and return', 'Remessa e retorno CNAB', 'Remise et retour CNAB'),
    summary: t(
      'Bank file out, bank file back — Brazilian sliding-window billing.',
      'Arquivo para o banco, arquivo de volta — cobrança registrada no Brasil.',
      'Fichier vers la banque, fichier en retour — encaissement Brésil.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Finances', 'CNAB Banking'],
        [...turbo, 'Finanças', 'CNAB Bancário'],
        [...turbo, 'Finances', 'CNAB'],
      ) },
      { type: 'steps', items: [
        { title: t('Export remessa', 'Exporte a remessa', 'Exportez la remise'), body: t(
          'Only after invoices exist. Empty remessa means generate first.',
          'Só depois das faturas existirem. Remessa vazia: gere primeiro.',
          'Seulement après les factures. Remise vide : générez d’abord.',
        ) },
        { title: t('Import retorno', 'Importe o retorno', 'Importez le retour'), body: t(
          'Paid titles should match the cashbook. Incoerência de recebimento is a report, not a feeling.',
          'Títulos pagos devem bater com o livro caixa. Incoerência de recebimento é relatório, não feeling.',
          'Les titres payés doivent coller au livre de caisse. L’incohérence d’encaissement est un rapport, pas une impression.',
        ) },
      ] },
      { type: 'related', slugs: ['generate-invoices'] },
    ],
  },
  {
    slug: 'carnes',
    category: 'billing',
    minutes: 4,
    title: t('Carnês', 'Carnês', 'Carnets'),
    summary: t(
      'Printable installment books from the same invoice engine.',
      'Carnês imprimíveis a partir do mesmo motor de faturas.',
      'Carnets imprimables depuis le même moteur de factures.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Finances', 'Carnês'],
        [...turbo, 'Finanças', 'Carnês'],
        [...turbo, 'Finances', 'Carnets'],
      ) },
      { type: 'p', text: t(
        'Use carnês when the customer still pays at a lotérica or with a booklet. Gateways and carnês can coexist on a tenant — pick per contract.',
        'Use carnê quando o cliente ainda paga na lotérica ou com bloqueto. Gateway e carnê podem coexistir no tenant — escolha por contrato.',
        'Utilisez le carnet si le client paie encore au bureau de tabac / booklet. Passerelle et carnet peuvent coexister — choisissez par contrat.',
      ) },
      { type: 'related', slugs: ['generate-invoices', 'payment-gateways'] },
    ],
  },
  {
    slug: 'brazil-invoices',
    category: 'fiscal',
    minutes: 6,
    title: t('Brazilian fiscal notes', 'Notas fiscais no Brasil', 'Notes fiscales au Brésil'),
    summary: t(
      'NF 21/22, NF-e 55, NFS-e — configure the tenant, then generate. Homologation is on you with SEFAZ/the city.',
      'NF 21/22, NF-e 55, NFS-e — configure o tenant e gere. Homologação é com você na SEFAZ/prefeitura.',
      'NF 21/22, NF-e 55, NFS-e — configurez le tenant, puis générez. L’homologation est à vous auprès de SEFAZ / la ville.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Finances', 'Invoices'],
        [...turbo, 'Finanças', 'Faturas'],
        [...turbo, 'Finances', 'Factures'],
      ) },
      { type: 'callout', kind: 'warn', text: t(
        'Software can emit a note only after A1/P12, municipal NFS-e URL, and homologation exist. Missing those is a credential gap, not a missing menu.',
        'O software só emite nota com A1/P12, URL de NFS-e municipal e homologação. Falta disso é credencial, não menu ausente.',
        'Le logiciel n’émet une note qu’avec A1/P12, URL NFS-e municipale et homologation. Leur absence est un trou de credentials, pas un menu manquant.',
      ) },
      { type: 'ul', items: [
        t('NFCom / modelo 21–22 for telecom.', 'NFCom / modelo 21–22 para telecom.', 'NFCom / modèle 21–22 pour le télécom.'),
        t('NF-e 55 when you sell goods.', 'NF-e 55 quando vende mercadoria.', 'NF-e 55 quand vous vendez des biens.'),
        t('NFS-e is city-specific — the endpoint is per municipality.', 'NFS-e é por município — o endpoint é da prefeitura.', 'NFS-e est par ville — l’endpoint est municipal.'),
      ] },
      { type: 'related', slugs: ['generate-invoices', 'global-settings'] },
    ],
  },
]
