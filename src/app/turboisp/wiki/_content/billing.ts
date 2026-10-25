import type { Article } from './types'
import { t, trail } from './helpers'

const turbo = ['TurboMenu'] as const

export const billingFiscal: Article[] = [
  {
    slug: 'payment-gateways',
    category: 'billing',
    minutes: 6,
    title: t('Turn on a payment gateway', 'Ligar um gateway de pagamento', 'Activer une passerelle de paiement', 'Activar una pasarela de pago'),
    summary: t(
      'ASAAS, EFI, Stripe, PayPal — credentials live on the tenant, not in a shared platform key.',
      'ASAAS, EFI, Stripe, PayPal — credenciais no tenant, não numa chave de plataforma compartilhada.',
      'ASAAS, EFI, Stripe, PayPal — identifiants sur le tenant, pas une clé plateforme partagée.',
      'ASAAS, EFI, Stripe, PayPal: las credenciales viven en el operador, no en una clave compartida de la plataforma.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'Financials', 'Gateways'],
        [...turbo, 'Configurações', 'Financeiro', 'Gateways'],
        [...turbo, 'Paramètres', 'Finances', 'Passerelles'],
        [...turbo, 'Configuración', 'Finanzas', 'Pasarelas'],
      ) },
      { type: 'steps', items: [
        { title: t('Pick the provider this POP actually uses', 'Escolha o provedor que este POP usa', 'Choisissez le prestataire que ce POP utilise', 'Elige el proveedor que este POP realmente usa'), body: t(
          'Brazil tenants typically start with ASAAS or EFI. Canada Interac on launch is recorded as a manual settlement — not a live PSP click.',
          'Tenants Brasil em geral começam com ASAAS ou EFI. Interac no Canadá, no lançamento, é liquidação manual — não um clique de PSP ao vivo.',
          'Les tenants Brésil commencent souvent par ASAAS ou EFI. Interac Canada au lancement = règlement manuel — pas un clic PSP live.',
          'En Brasil se suele empezar con ASAAS o EFI. En Canadá, Interac en el lanzamiento se registra como liquidación manual, no como un clic en vivo del PSP.',
        ) },
        { title: t('Save wallets too', 'Salve as carteiras também', 'Enregistrez aussi les wallets', 'Guarda también las carteras'), body: t(
          'Settings → Financials → Wallets. Cashbook entries need a wallet even when the gateway is online.',
          'Configurações → Financeiro → Carteiras. Lançamentos de caixa precisam de carteira mesmo com gateway online.',
          'Paramètres → Finances → Wallets. Les écritures de caisse ont besoin d’un wallet même si la passerelle est en ligne.',
          'Configuración → Finanzas → Carteras. Los asientos de caja necesitan una cartera aunque la pasarela esté en línea.',
        ) },
      ] },
      { type: 'related', slugs: ['generate-invoices', 'dunning'] },
    ],
  },
  {
    slug: 'generate-invoices',
    category: 'billing',
    minutes: 8,
    title: t('Generate invoices in bulk', 'Gerar faturas em lote', 'Générer les factures en lot', 'Generar facturas en lote'),
    summary: t(
      'Monthly titles from active contracts. Bulk generate is an admin action.',
      'Títulos do mês a partir de contratos ativos. Gerar em lote é ação de admin.',
      'Titres du mois depuis les contrats actifs. La génération en masse est une action admin.',
      'Títulos del mes a partir de contratos activos. La generación masiva es una acción de admin.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Finances', 'Invoices'],
        [...turbo, 'Finanças', 'Faturas'],
        [...turbo, 'Finances', 'Factures'],
        [...turbo, 'Finanzas', 'Facturas'],
      ) },
      { type: 'steps', items: [
        { title: t('Confirm due dates and plans first', 'Confirme vencimentos e planos antes', 'Confirmez échéances et forfaits d’abord', 'Confirma vencimientos y planes primero'), body: t(
          'Wrong plan price reproduces on every invoice. Fix the plan, then generate — do not hand-edit a thousand rows.',
          'Preço de plano errado se reproduz em toda fatura. Corrija o plano e gere — não edite mil linhas na mão.',
          'Un mauvais prix de forfait se recopie sur chaque facture. Corrigez le forfait, puis générez — n’éditez pas mille lignes à la main.',
          'Un precio de plan incorrecto se copia en cada factura. Corrige el plan y luego genera: no edites mil filas a mano.',
        ) },
        { title: t('Run generate', 'Rode a geração', 'Lancez la génération', 'Ejecuta la generación'), body: t(
          'Bulk POST is admin-only. After it finishes, spot-check a known customer and the cashbook.',
          'O POST em lote é só admin. Depois, cheque um cliente conhecido e o livro caixa.',
          'Le POST de masse est admin-only. Ensuite, vérifiez un client connu et le livre de caisse.',
          'El POST masivo es solo para admin. Al terminar, revisa un cliente conocido y el libro de caja.',
        ) },
      ] },
      { type: 'related', slugs: ['dunning', 'carnes', 'cnab'] },
    ],
  },
  {
    slug: 'dunning',
    category: 'billing',
    minutes: 6,
    title: t('Dunning, suspend, restore', 'Cobrança, suspender, restaurar', 'Relance, suspendre, rétablir', 'Cobranza, suspender, restaurar'),
    summary: t(
      'Reminders, then suspension, then restore when the invoice clears.',
      'Lembretes, depois suspensão, depois restauração quando a fatura é paga.',
      'Rappels, puis suspension, puis rétablissement quand la facture est soldée.',
      'Recordatorios, luego suspensión y restauración cuando la factura se paga.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Finances', 'Dunning'],
        [...turbo, 'Finanças', 'Cobrança'],
        [...turbo, 'Finances', 'Relance'],
        [...turbo, 'Finanzas', 'Cobranza'],
      ) },
      { type: 'p', text: t(
        'SMS-shaped dunning on launch goes out over WhatsApp Cloud, not a separate SMS vendor. Keep messages transactional.',
        'Dunning com cara de SMS no lançamento sai pelo WhatsApp Cloud, não por um SMS separado. Mantenha as mensagens transacionais.',
        'La relance type SMS au lancement part via WhatsApp Cloud, pas un SMS séparé. Gardez les messages transactionnels.',
        'En el lanzamiento, la cobranza con formato de SMS sale por WhatsApp Cloud, no por un proveedor de SMS aparte. Mantén los mensajes transaccionales.',
      ) },
      { type: 'related', slugs: ['generate-invoices', 'email-whatsapp', 'disconnect-session'] },
    ],
  },
  {
    slug: 'cnab',
    category: 'billing',
    minutes: 6,
    title: t('CNAB remittance and return', 'Remessa e retorno CNAB', 'Remise et retour CNAB', 'Remesa y retorno CNAB'),
    summary: t(
      'Bank file out, bank file back — Brazilian sliding-window billing.',
      'Arquivo para o banco, arquivo de volta — cobrança registrada no Brasil.',
      'Fichier vers la banque, fichier en retour — encaissement au Brésil.',
      'Archivo al banco y archivo de vuelta: cobranza registrada de Brasil.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Finances', 'CNAB Banking'],
        [...turbo, 'Finanças', 'CNAB Bancário'],
        [...turbo, 'Finances', 'CNAB'],
        [...turbo, 'Finanzas', 'CNAB bancario'],
      ) },
      { type: 'steps', items: [
        { title: t('Export remessa', 'Exporte a remessa', 'Exportez la remise', 'Exporta la remesa'), body: t(
          'Only after invoices exist. Empty remessa means generate first.',
          'Só depois das faturas existirem. Remessa vazia: gere primeiro.',
          'Seulement après les factures. Remise vide: générez d’abord.',
          'Solo después de que existan facturas. Si la remesa sale vacía, genera primero.',
        ) },
        { title: t('Import retorno', 'Importe o retorno', 'Importez le retour', 'Importa el retorno'), body: t(
          'Paid titles should match the cashbook. Incoerência de recebimento is a report, not a feeling.',
          'Títulos pagos devem bater com o livro caixa. Incoerência de recebimento é relatório, não feeling.',
          'Les titres payés doivent coller au livre de caisse. L’incohérence d’encaissement est un rapport, pas une impression.',
          'Los títulos pagados tienen que coincidir con el libro de caja. La incoherencia de cobro es un reporte, no una impresión.',
        ) },
      ] },
      { type: 'related', slugs: ['generate-invoices'] },
    ],
  },
  {
    slug: 'carnes',
    category: 'billing',
    minutes: 4,
    title: t('Carnês', 'Carnês', 'Carnets', 'Cupones (carnês)'),
    summary: t(
      'Printable installment books from the same invoice engine.',
      'Carnês imprimíveis a partir do mesmo motor de faturas.',
      'Carnets imprimables depuis le même moteur de factures.',
      'Cupones imprimibles, generados por el mismo motor de facturas.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Finances', 'Carnês'],
        [...turbo, 'Finanças', 'Carnês'],
        [...turbo, 'Finances', 'Carnets'],
        [...turbo, 'Finanzas', 'Cupones'],
      ) },
      { type: 'p', text: t(
        'Use carnês when the customer still pays at a lotérica or with a booklet. Gateways and carnês can coexist on a tenant — pick per contract.',
        'Use carnê quando o cliente ainda paga na lotérica ou com boleto. Gateway e carnê podem coexistir no tenant — escolha por contrato.',
        'Au Brésil, utilisez le carnet si le client paie encore en loterie ou par boleto. Passerelle et carnet peuvent coexister — choisissez par contrat.',
        'En Brasil, usa el carnê cuando el cliente aún paga en una lotérica o con boleto. La pasarela y el carnê pueden convivir: elige por contrato.',
      ) },
      { type: 'related', slugs: ['generate-invoices', 'payment-gateways'] },
    ],
  },
  {
    slug: 'brazil-invoices',
    category: 'fiscal',
    minutes: 6,
    title: t('Brazilian fiscal notes', 'Notas fiscais no Brasil', 'Notes fiscales au Brésil', 'Notas fiscales en Brasil'),
    summary: t(
      'NF 21/22, NF-e 55, NFS-e — configure the tenant, then generate. Homologation is on you with SEFAZ/the city.',
      'NF 21/22, NF-e 55, NFS-e — configure o tenant e gere. Homologação é com você na SEFAZ/prefeitura.',
      'Brésil seulement: NF 21/22, NF-e 55, NFS-e. Configurez le tenant, puis générez. L’homologation est à vous auprès de SEFAZ ou de la ville.',
      'Solo Brasil: NF 21/22, NF-e 55 y NFS-e. Configura el operador y genera. La homologación corre por tu cuenta ante SEFAZ o el municipio.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Finances', 'Invoices'],
        [...turbo, 'Finanças', 'Faturas'],
        [...turbo, 'Finances', 'Factures'],
        [...turbo, 'Finanzas', 'Facturas'],
      ) },
      { type: 'callout', kind: 'warn', text: t(
        'Software can emit a note only after A1/P12, municipal NFS-e URL, and homologation exist. Missing those is a credential gap, not a missing menu.',
        'O software só emite nota com A1/P12, URL de NFS-e municipal e homologação. Falta disso é credencial, não menu ausente.',
        'Le logiciel n’émet une note qu’avec A1/P12, URL NFS-e municipale et homologation. Leur absence est un trou de credentials, pas un menu manquant.',
        'El sistema solo emite la nota con certificado A1/P12, URL municipal de NFS-e y homologación. Si falta eso, es un problema de credenciales, no un menú que no existe.',
      ) },
      { type: 'ul', items: [
        t('NFCom / modelo 21–22 for telecom.', 'NFCom / modelo 21–22 para telecom.', 'NFCom / modèle 21–22 pour le télécom (Brésil).', 'NFCom / modelo 21–22 para telecom (Brasil).'),
        t('NF-e 55 when you sell goods.', 'NF-e 55 quando vende mercadoria.', 'NF-e 55 quand vous vendez des biens (Brésil).', 'NF-e 55 cuando vendes mercancía (Brasil).'),
        t('NFS-e is city-specific — the endpoint is per municipality.', 'NFS-e é por município — o endpoint é da prefeitura.', 'NFS-e est par ville — l’endpoint est municipal (Brésil).', 'NFS-e es por municipio: el endpoint es de la alcaldía (Brasil).'),
      ] },
      { type: 'related', slugs: ['generate-invoices', 'global-settings'] },
    ],
  },
]
