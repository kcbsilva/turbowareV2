import type { Article } from './types'
import { t, trail } from './helpers'

const turbo = ['TurboMenu'] as const

export const opsArticles: Article[] = [
  {
    slug: 'service-orders',
    category: 'field',
    minutes: 7,
    title: t('Create a service order', 'Criar uma ordem de serviço', 'Créer un ordre de service'),
    summary: t(
      'Dispatch, schedule, materials, and close with a signature.',
      'Despacho, agenda, materiais e encerramento com assinatura.',
      'Dispatch, planning, matériel, et clôture avec signature.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Service Calls'],
        [...turbo, 'Ordens de Serviço'],
        [...turbo, 'Interventions'],
      ) },
      { type: 'steps', items: [
        { title: t('Pick the service type', 'Escolha o tipo de serviço', 'Choisissez le type de service'), body: t(
          'Install vs repair vs survey changes the checklist the technician sees on the field app.',
          'Instalação vs reparo vs vistoria muda o checklist que o técnico vê no app de campo.',
          'Install vs réparation vs survey change la checklist vue dans l’app terrain.',
        ) },
        { title: t('Schedule, then assign', 'Agende, depois atribua', 'Planifiez, puis assignez'), body: t(
          'Scheduling is its own window. An unassigned OS sits in the queue until someone owns the route.',
          'Agendamento é janela própria. OS sem dono fica na fila até alguém assumir a rota.',
          'Le planning est une fenêtre à part. Un OS non assigné reste en file jusqu’à ce que quelqu’un prenne la tournée.',
        ) },
      ] },
      { type: 'related', slugs: ['field-app', 'installation-kits'] },
    ],
  },
  {
    slug: 'field-app',
    category: 'field',
    minutes: 5,
    title: t('Use the field app', 'Usar o app de campo', 'Utiliser l’app terrain'),
    summary: t(
      'PWA on the technician’s phone — offline, checklist, signature.',
      'PWA no celular do técnico — offline, checklist, assinatura.',
      'PWA sur le téléphone du technicien — hors ligne, checklist, signature.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Service Calls', 'Field App'],
        [...turbo, 'Ordens de Serviço', 'Aplicativo de Campo'],
        [...turbo, 'Interventions', 'App terrain'],
      ) },
      { type: 'p', text: t(
        'Install the PWA from the field route. SignaturePad is the close-out, not a screenshot in WhatsApp.',
        'Instale o PWA pela rota de campo. SignaturePad é o encerramento, não um print no WhatsApp.',
        'Installez la PWA depuis la route terrain. SignaturePad clôture — pas une capture dans WhatsApp.',
      ) },
      { type: 'related', slugs: ['service-orders'] },
    ],
  },
  {
    slug: 'inventory-basics',
    category: 'inventory',
    minutes: 6,
    title: t('Warehouses, products, stock', 'Depósitos, produtos, saldo', 'Entrepôts, produits, stock'),
    summary: t(
      'Locations, SKUs, and movements — including NFe inbound.',
      'Locais, SKUs e movimentações — inclusive entrada via NF-e.',
      'Lieux, SKUs et mouvements — y compris entrée via NF-e.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Inventory', 'Products'],
        [...turbo, 'Estoque', 'Produtos'],
        [...turbo, 'Inventaire', 'Produits'],
      ) },
      { type: 'ul', items: [
        t('Warehouses first, then products, then a purchase or transfer.', 'Depósitos primeiro, depois produtos, depois compra ou transferência.', 'Entrepôts d’abord, puis produits, puis achat ou transfert.'),
        t('HS / NCM codes sit on the product for fiscal outbound.', 'NCM fica no produto para a saída fiscal.', 'Les codes NCM sont sur le produit pour la sortie fiscale.'),
        t('Vehicles are fleet assets, not subscriber CPE.', 'Veículos são frota, não CPE do assinante.', 'Les véhicules sont la flotte, pas le CPE abonné.'),
      ] },
      { type: 'related', slugs: ['installation-kits', 'commodato'] },
    ],
  },
  {
    slug: 'installation-kits',
    category: 'inventory',
    minutes: 4,
    title: t('Installation kits', 'Kits de instalação', 'Kits d’installation'),
    summary: t(
      'A bundle that leaves the warehouse when an install OS is completed.',
      'Um pacote que sai do depósito quando a OS de instalação fecha.',
      'Un lot qui sort de l’entrepôt quand l’OS d’install se clôt.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Inventory'],
        [...turbo, 'Estoque'],
        [...turbo, 'Inventaire'],
      ) },
      { type: 'p', text: t(
        'Put ONU, drop, and connectors in the kit so field close-out does not require three separate withdrawals.',
        'Coloque ONU, drop e conectores no kit para o encerramento de campo não exigir três baixas soltas.',
        'Mettez ONU, drop et connecteurs dans le kit pour que la clôture terrain n’exige pas trois sorties séparées.',
      ) },
      { type: 'related', slugs: ['service-orders', 'inventory-basics'] },
    ],
  },
  {
    slug: 'commodato',
    category: 'inventory',
    minutes: 5,
    title: t('Comodato / CPE on the customer', 'Comodato / CPE no cliente', 'Comodato / CPE chez le client'),
    summary: t(
      'Equipment on loan is subscriber equipment, not a vanished warehouse row.',
      'Equipamento em comodato é CPE do assinante, não uma linha de estoque sumida.',
      'Le matériel en prêt est l’équipement abonné, pas une ligne de stock disparue.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Subscribers', 'Profile', 'Inventory'],
        [...turbo, 'Assinantes', 'Perfil', 'Estoque'],
        [...turbo, 'Abonnés', 'Profil', 'Inventaire'],
      ) },
      { type: 'p', text: t(
        'Add the serial on the subscriber. Recover it on churn or you will never reconcile ONU counts.',
        'Lance o serial no assinante. Recupere no churn ou você nunca concilia contagem de ONU.',
        'Ajoutez le serial sur l’abonné. Récupérez-le au churn, sinon vous ne réconciliez jamais les ONU.',
      ) },
      { type: 'related', slugs: ['inventory-basics', 'create-subscriber'] },
    ],
  },
  {
    slug: 'add-olt',
    category: 'provisioning',
    minutes: 8,
    title: t('Add an OLT', 'Cadastrar uma OLT', 'Ajouter une OLT'),
    summary: t(
      'Chassis in the tenant, templates, then ONUs can be queued.',
      'Chassis no tenant, templates, aí as ONUs entram na fila.',
      'Châssis dans le tenant, modèles, puis les ONU peuvent être mises en file.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'NOC', 'Provisioning — OLTs'],
        [...turbo, 'NOC', 'Provisionamento — OLTs'],
        [...turbo, 'NOC', 'Provisionnement — OLT'],
      ) },
      { type: 'steps', items: [
        { title: t('Register the OLT', 'Cadastre a OLT', 'Enregistrez l’OLT'), body: t(
          'Management IP, vendor, and credentials. Least privilege — the box does not need your NOC admin password.',
          'IP de gestão, vendor e credenciais. Least privilege — a caixa não precisa da senha admin do NOC.',
          'IP de gestion, vendor et identifiants. Least privilege — la boîte n’a pas besoin du mot de passe admin NOC.',
        ) },
        { title: t('Attach templates', 'Vincule templates', 'Attachez les modèles'), body: t(
          'OLT templates and ONU templates are separate windows. Provisioning uses both.',
          'Modelos de OLT e de ONU são janelas separadas. O provisionamento usa os dois.',
          'Modèles OLT et ONU sont des fenêtres séparées. Le provisionnement utilise les deux.',
        ) },
      ] },
      { type: 'related', slugs: ['provision-onu', 'provisioning-queue'] },
    ],
  },
  {
    slug: 'provision-onu',
    category: 'provisioning',
    minutes: 8,
    title: t('Provision an ONU', 'Provisionar uma ONU', 'Provisionner une ONU'),
    summary: t(
      'Serial to OLT to contract — then watch the queue.',
      'Serial na OLT no contrato — depois olhe a fila.',
      'Serial vers OLT vers contrat — puis surveillez la file.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'NOC', 'Provisioning — ONUs'],
        [...turbo, 'NOC', 'Provisionamento — ONUs'],
        [...turbo, 'NOC', 'Provisionnement — ONU'],
      ) },
      { type: 'steps', items: [
        { title: t('Match serial and contract', 'Case serial e contrato', 'Associez serial et contrat'), body: t(
          'The ONU belongs to a subscriber contract, not to “the OLT in general”. Wrong contract = wrong VLAN/speed.',
          'A ONU pertence a um contrato de assinante, não “à OLT em geral”. Contrato errado = VLAN/velocidade erradas.',
          'L’ONU appartient à un contrat abonné, pas « à l’OLT en général ». Mauvais contrat = VLAN/débit faux.',
        ) },
        { title: t('Queue, do not stare at the OLT CLI', 'Fila, não fique no CLI da OLT', 'File, ne restez pas sur le CLI OLT'), body: t(
          'Jobs retry with backoff. There is an operator Retry on the queue window if a job failed cleanly.',
          'Jobs retentam com backoff. Existe Retry do operador na janela da fila se o job falhou limpo.',
          'Les jobs retentent avec backoff. Il y a un Retry opérateur sur la fenêtre de file si le job a échoué proprement.',
        ) },
      ] },
      { type: 'related', slugs: ['add-olt', 'provisioning-queue', 'add-contract'] },
    ],
  },
  {
    slug: 'provisioning-queue',
    category: 'provisioning',
    minutes: 4,
    title: t('Watch the provisioning queue', 'Acompanhar a fila de provisionamento', 'Suivre la file de provisionnement'),
    summary: t(
      'Pending, failed, retry — this is the truth, not the last SSH session.',
      'Pendente, falhou, retry — esta é a verdade, não o último SSH.',
      'En attente, échoué, retry — c’est la vérité, pas la dernière session SSH.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'NOC', 'Provisioning — Queue'],
        [...turbo, 'NOC', 'Provisionamento — Fila'],
        [...turbo, 'NOC', 'Provisionnement — File'],
      ) },
      { type: 'callout', kind: 'tip', text: t(
        'Deprovision is a first-class action in the same area. Do not delete the ONU from the OLT and leave the contract live.',
        'Desprovisionar é ação de primeira classe na mesma área. Não apague a ONU na OLT e deixe o contrato vivo.',
        'Le déprovisionnement est une action de premier plan dans la même zone. N’effacez pas l’ONU sur l’OLT en laissant le contrat vivant.',
      ) },
      { type: 'related', slugs: ['provision-onu'] },
    ],
  },
  {
    slug: 'noc-overview',
    category: 'noc',
    minutes: 5,
    title: t('NOC overview', 'Visão geral do NOC', 'Aperçu NOC'),
    summary: t(
      'Fiber, wireless, FWA, devices, ACS — one place to see what is sick.',
      'Fibra, wireless, FWA, devices, ACS — um lugar para ver o que está doente.',
      'Fibre, sans fil, FWA, équipements, ACS — un endroit pour voir ce qui va mal.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'NOC', 'NOC Overview'],
        [...turbo, 'NOC', 'Visão geral do NOC'],
        [...turbo, 'NOC', 'Aperçu NOC'],
      ) },
      { type: 'p', text: t(
        'Alarms and polling are only as good as the device credentials. Rotate them in the device window — do not leave factory passwords.',
        'Alarmes e polling só são tão bons quanto as credenciais do device. Rotacione na janela do equipamento — não deixe senha de fábrica.',
        'Alarmes et polling ne valent que les identifiants device. Faites-les tourner dans la fenêtre équipement — pas de mot de passe usine.',
      ) },
      { type: 'related', slugs: ['disconnect-session', 'add-olt'] },
    ],
  },
  {
    slug: 'disconnect-session',
    category: 'noc',
    minutes: 4,
    title: t('Disconnect a session', 'Desconectar uma sessão', 'Déconnecter une session'),
    summary: t(
      'CoA Disconnect to the NAS. The worktop is not a substitute for UDP 3799 reaching the box.',
      'CoA Disconnect no NAS. O worktop não substitui UDP 3799 chegando na caixa.',
      'CoA Disconnect vers le NAS. Le worktop ne remplace pas l’UDP 3799 jusqu’à la boîte.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Subscribers', 'Client sessions'],
        [...turbo, 'Assinantes', 'Sessões de clientes'],
        [...turbo, 'Abonnés', 'Sessions clients'],
      ) },
      { type: 'callout', kind: 'warn', text: t(
        'If CoA returns CONFIG_ERROR, the NAS host/secret/port is wrong in RADIUS settings. Fix that before blaming the subscriber.',
        'Se o CoA voltar CONFIG_ERROR, host/secret/porta do NAS está errado no RADIUS. Arrume isso antes de culpar o assinante.',
        'Si CoA renvoie CONFIG_ERROR, hôte/secret/port NAS est faux dans RADIUS. Corrigez ça avant d’accuser l’abonné.',
      ) },
      { type: 'related', slugs: ['radius-nas', 'client-sessions', 'dunning'] },
    ],
  },
  {
    slug: 'customer-portal',
    category: 'portal',
    minutes: 5,
    title: t('Customer portal', 'Portal do cliente', 'Portail client'),
    summary: t(
      'Subscribers pay, open tickets, and see invoices on a separate login.',
      'Assinantes pagam, abrem tickets e veem faturas noutro login.',
      'Les abonnés paient, ouvrent des tickets et voient les factures sur un autre login.',
    ),
    body: [
      { type: 'p', text: t(
        'Portal URL is /{tenant}/portal-login. Staff worktop is /{tenant}/login. Mixing them is the #1 “I cannot see subscribers” report from new cashiers.',
        'URL do portal é /{tenant}/portal-login. Worktop da equipe é /{tenant}/login. Misturar os dois é o erro nº 1 de caixa novo.',
        'URL portail = /{tenant}/portal-login. Worktop staff = /{tenant}/login. Les mélanger est l’erreur n°1 des nouveaux caissiers.',
      ) },
      { type: 'steps', items: [
        { title: t('Set a portal password on the subscriber', 'Defina senha do portal no assinante', 'Définissez le mot de passe portail sur l’abonné'), body: t(
          'It is a field on create/edit — not a separate “portal user” module.',
          'É um campo no criar/editar — não um módulo separado de “usuário do portal”.',
          'C’est un champ à la création/édition — pas un module « utilisateur portail » séparé.',
        ) },
      ] },
      { type: 'related', slugs: ['create-subscriber', 'email-whatsapp'] },
    ],
  },
  {
    slug: 'email-whatsapp',
    category: 'portal',
    minutes: 5,
    title: t('Email and WhatsApp', 'E-mail e WhatsApp', 'E-mail et WhatsApp'),
    summary: t(
      'Transactional mail and Cloud API WhatsApp. Not a marketing blast tool.',
      'E-mail transacional e WhatsApp Cloud API. Não é ferramenta de disparo de marketing.',
      'Mail transactionnel et WhatsApp Cloud API. Pas un outil de blast marketing.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Messenger'],
        [...turbo, 'Mensageiro'],
        [...turbo, 'Messagerie'],
      ) },
      { type: 'p', text: t(
        'Departments, channels, and flows live under Messenger. Dunning that says “SMS” still uses WhatsApp Cloud on launch.',
        'Departamentos, canais e fluxos ficam no Mensageiro. Dunning que diz “SMS” ainda usa WhatsApp Cloud no lançamento.',
        'Départements, canaux et flux sont sous Messagerie. La relance dite « SMS » utilise encore WhatsApp Cloud au lancement.',
      ) },
      { type: 'related', slugs: ['dunning', 'customer-portal'] },
    ],
  },
  {
    slug: 'reports',
    category: 'reports',
    minutes: 4,
    title: t('Reports', 'Relatórios', 'Rapports'),
    summary: t(
      'Contracts, delinquents, system activity, regulatory extracts.',
      'Contratos, inadimplentes, atividade do sistema, extratos regulatórios.',
      'Contrats, impayés, activité système, extraits réglementaires.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Reports'],
        [...turbo, 'Relatórios'],
        [...turbo, 'Rapports'],
      ) },
      { type: 'ul', items: [
        t('Administrative: clients, contracts, delinquents.', 'Administrativo: clientes, contratos, inadimplentes.', 'Administratif : clients, contrats, impayés.'),
        t('System activity for audit, not for NOC alarms.', 'Atividade do sistema para auditoria, não para alarme de NOC.', 'Activité système pour l’audit, pas pour les alarmes NOC.'),
        t('Regulatory extracts (e.g. SICI-style) when the tenant country requires them.', 'Extratos regulatórios (ex. cara de SICI) quando o país do tenant exige.', 'Extraits réglementaires (ex. type SICI) si le pays du tenant l’exige.'),
      ] },
      { type: 'related', slugs: ['generate-invoices', 'noc-overview'] },
    ],
  },
  {
    slug: 'global-settings',
    category: 'settings',
    minutes: 5,
    title: t('Global settings', 'Configurações globais', 'Paramètres globaux'),
    summary: t(
      'Locale, map keys, and tenant-wide defaults. Always scoped to this operator.',
      'Locale, chaves de mapa e padrões do tenant. Sempre deste operador.',
      'Locale, clés carte et défauts du tenant. Toujours cet opérateur.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'General', 'Global settings'],
        [...turbo, 'Configurações', 'Geral', 'Configurações globais'],
        [...turbo, 'Paramètres', 'Général', 'Paramètres globaux'],
      ) },
      { type: 'p', text: t(
        'File storage, security, companies, and the migration assistant live under Settings as well. Superadmin-only tools are hidden from ordinary staff.',
        'Armazenamento de arquivos, segurança, empresas e o assistente de migração também ficam em Configurações. Ferramentas só de superadmin ficam ocultas da equipe comum.',
        'Stockage fichiers, sécurité, sociétés et assistant de migration sont aussi sous Paramètres. Les outils superadmin-only sont cachés au staff ordinaire.',
      ) },
      { type: 'related', slugs: ['map-api-keys', 'staff-and-permissions', 'setup-checklist'] },
    ],
  },
]
