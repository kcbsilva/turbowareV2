import type { Article } from './types'
import { t, trail } from './helpers'

const turbo = ['TurboMenu'] as const

export const opsArticles: Article[] = [
  {
    slug: 'service-orders',
    category: 'field',
    minutes: 7,
    title: t('Create a service order', 'Criar uma ordem de serviço', 'Créer un ordre de service', 'Crear una orden de servicio'),
    summary: t(
      'Dispatch, schedule, materials, and close with a signature.',
      'Despacho, agenda, materiais e encerramento com assinatura.',
      'Répartition, planification, matériel et clôture avec signature.',
      'Despacho, agenda, materiales y cierre con firma.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Service Calls'],
        [...turbo, 'Ordens de Serviço'],
        [...turbo, 'Interventions'],
        [...turbo, 'Órdenes de servicio'],
      ) },
      { type: 'steps', items: [
        { title: t('Pick the service type', 'Escolha o tipo de serviço', 'Choisissez le type de service', 'Elige el tipo de servicio'), body: t(
          'Install vs repair vs survey changes the checklist the technician sees on the field app.',
          'Instalação vs reparo vs vistoria muda o checklist que o técnico vê no app de campo.',
          'L’installation, la réparation ou le relevé change la checklist vue dans l’app terrain.',
          'Instalación, reparación o relevamiento: cambia la lista que el técnico ve en la app de campo.',
        ) },
        { title: t('Schedule, then assign', 'Agende, depois atribua', 'Planifiez, puis assignez', 'Agenda y luego asigna'), body: t(
          'Scheduling is its own window. An unassigned OS sits in the queue until someone owns the route.',
          'Agendamento é uma janela própria. Chamado sem responsável fica na fila até alguém assumir a rota.',
          'La planification est une fenêtre à part. Un ticket non assigné reste en file jusqu’à ce que quelqu’un prenne la tournée.',
          'La agenda es una ventana aparte. Una orden sin responsable se queda en la cola hasta que alguien tome la ruta.',
        ) },
      ] },
      { type: 'related', slugs: ['field-app', 'installation-kits'] },
    ],
  },
  {
    slug: 'field-app',
    category: 'field',
    minutes: 5,
    title: t('Use the field app', 'Usar o app de campo', 'Utiliser l’app terrain', 'Usar la app de campo'),
    summary: t(
      'PWA on the technician’s phone — offline, checklist, signature.',
      'PWA no celular do técnico — offline, checklist, assinatura.',
      'PWA sur le téléphone du technicien — hors ligne, checklist, signature.',
      'PWA en el celular del técnico: sin conexión, checklist y firma.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Service Calls', 'Field App'],
        [...turbo, 'Ordens de Serviço', 'Aplicativo de Campo'],
        [...turbo, 'Interventions', 'App terrain'],
        [...turbo, 'Órdenes de servicio', 'App de campo'],
      ) },
      { type: 'p', text: t(
        'Install the PWA from the field route. SignaturePad is the close-out, not a screenshot in WhatsApp.',
        'Instale o PWA pela rota de campo. SignaturePad é o encerramento, não um print no WhatsApp.',
        'Installez la PWA depuis la route terrain. SignaturePad clôture — pas une capture dans WhatsApp.',
        'Instala la PWA desde la ruta de campo. SignaturePad es el cierre, no una captura en WhatsApp.',
      ) },
      { type: 'related', slugs: ['service-orders'] },
    ],
  },
  {
    slug: 'inventory-basics',
    category: 'inventory',
    minutes: 6,
    title: t('Warehouses, products, stock', 'Depósitos, produtos, saldo', 'Entrepôts, produits, stock', 'Depósitos, productos y saldo'),
    summary: t(
      'Locations, SKUs, and movements — including NFe inbound.',
      'Locais, SKUs e movimentações — inclusive entrada via NF-e.',
      'Lieux, SKUs et mouvements — y compris l’entrée par NF-e (Brésil).',
      'Ubicaciones, SKU y movimientos, incluida la entrada por NF-e (Brasil).',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Inventory', 'Products'],
        [...turbo, 'Estoque', 'Produtos'],
        [...turbo, 'Inventaire', 'Produits'],
        [...turbo, 'Inventario', 'Productos'],
      ) },
      { type: 'ul', items: [
        t('Warehouses first, then products, then a purchase or transfer.', 'Depósitos primeiro, depois produtos, depois compra ou transferência.', 'Entrepôts d’abord, puis produits, puis achat ou transfert.', 'Primero los depósitos, luego los productos y después una compra o una transferencia.'),
        t('HS / NCM codes sit on the product for fiscal outbound.', 'NCM fica no produto para a saída fiscal.', 'Les codes NCM (Brésil) sont sur le produit pour la sortie fiscale.', 'Los códigos arancelarios (NCM en Brasil) van en el producto para la salida fiscal.'),
        t('Vehicles are fleet assets, not subscriber CPE.', 'Veículos são frota, não CPE do assinante.', 'Les véhicules sont la flotte, pas le CPE abonné.', 'Los vehículos son de la flota, no el CPE del abonado.'),
      ] },
      { type: 'related', slugs: ['installation-kits', 'commodato'] },
    ],
  },
  {
    slug: 'installation-kits',
    category: 'inventory',
    minutes: 4,
    title: t('Installation kits', 'Kits de instalação', 'Kits d’installation', 'Kits de instalación'),
    summary: t(
      'A bundle that leaves the warehouse when an install OS is completed.',
      'Um pacote que sai do depósito quando o chamado de instalação é encerrado.',
      'Un lot qui sort de l’entrepôt quand le ticket d’installation se clôt.',
      'Un paquete que sale del depósito cuando se cierra la orden de instalación.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Inventory'],
        [...turbo, 'Estoque'],
        [...turbo, 'Inventaire'],
        [...turbo, 'Inventario'],
      ) },
      { type: 'p', text: t(
        'Put ONU, drop, and connectors in the kit so field close-out does not require three separate withdrawals.',
        'Coloque ONU, drop e conectores no kit para o encerramento de campo não exigir três baixas soltas.',
        'Mettez ONU, drop et connecteurs dans le kit pour que la clôture terrain n’exige pas trois sorties séparées.',
        'Pon la ONU, el drop y los conectores en el kit para que el cierre en campo no pida tres salidas separadas.',
      ) },
      { type: 'related', slugs: ['service-orders', 'inventory-basics'] },
    ],
  },
  {
    slug: 'commodato',
    category: 'inventory',
    minutes: 5,
    title: t('Comodato / CPE on the customer', 'Comodato / CPE no cliente', 'Comodato / CPE chez le client', 'Comodato / CPE en el cliente'),
    summary: t(
      'Equipment on loan is subscriber equipment, not a vanished warehouse row.',
      'Equipamento em comodato é CPE do assinante, não uma linha de estoque sumida.',
      'Le matériel en prêt est l’équipement abonné, pas une ligne de stock disparue.',
      'El equipo en comodato es el CPE del abonado, no una línea de inventario que desapareció.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Subscribers', 'Profile', 'Inventory'],
        [...turbo, 'Assinantes', 'Perfil', 'Estoque'],
        [...turbo, 'Abonnés', 'Profil', 'Inventaire'],
        [...turbo, 'Abonados', 'Perfil', 'Inventario'],
      ) },
      { type: 'p', text: t(
        'Add the serial on the subscriber. Recover it on churn or you will never reconcile ONU counts.',
        'Lance o serial no assinante. Recupere no churn ou você nunca concilia contagem de ONU.',
        'Ajoutez le serial sur l’abonné. Récupérez-le au churn, sinon vous ne réconciliez jamais les ONU.',
        'Registra el serial en el abonado. Recupéralo en la baja; si no, nunca cuadras el conteo de ONU.',
      ) },
      { type: 'related', slugs: ['inventory-basics', 'create-subscriber'] },
    ],
  },
  {
    slug: 'add-olt',
    category: 'provisioning',
    minutes: 8,
    title: t('Add an OLT', 'Cadastrar uma OLT', 'Ajouter une OLT', 'Registrar una OLT'),
    summary: t(
      'Chassis in the tenant, templates, then ONUs can be queued.',
      'Chassis no tenant, templates, aí as ONUs entram na fila.',
      'Châssis dans le tenant, modèles, puis les ONU peuvent être mises en file.',
      'Chasis en el operador, plantillas y después las ONU pueden entrar a la cola.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'NOC', 'Provisioning — OLTs'],
        [...turbo, 'NOC', 'Provisionamento — OLTs'],
        [...turbo, 'NOC', 'Provisionnement — OLT'],
        [...turbo, 'NOC', 'Aprovisionamiento — OLT'],
      ) },
      { type: 'steps', items: [
        { title: t('Register the OLT', 'Cadastre a OLT', 'Enregistrez l’OLT', 'Registra la OLT'), body: t(
          'Management IP, vendor, and credentials. Least privilege — the box does not need your NOC admin password.',
          'IP de gestão, vendor e credenciais. Least privilege — a caixa não precisa da senha admin do NOC.',
          'IP de gestion, vendor et identifiants. Least privilege — la boîte n’a pas besoin du mot de passe admin NOC.',
          'IP de gestión, fabricante y credenciales. Privilegio mínimo: el equipo no necesita la contraseña de admin del NOC.',
        ) },
        { title: t('Attach templates', 'Vincule templates', 'Attachez les modèles', 'Vincula las plantillas'), body: t(
          'OLT templates and ONU templates are separate windows. Provisioning uses both.',
          'Modelos de OLT e de ONU são janelas separadas. O provisionamento usa os dois.',
          'Modèles OLT et ONU sont des fenêtres séparées. Le provisionnement utilise les deux.',
          'Las plantillas de OLT y de ONU son ventanas separadas. El aprovisionamiento usa las dos.',
        ) },
      ] },
      { type: 'related', slugs: ['provision-onu', 'provisioning-queue'] },
    ],
  },
  {
    slug: 'provision-onu',
    category: 'provisioning',
    minutes: 8,
    title: t('Provision an ONU', 'Provisionar uma ONU', 'Provisionner une ONU', 'Aprovisionar una ONU'),
    summary: t(
      'Serial to OLT to contract — then watch the queue.',
      'Serial na OLT no contrato — depois olhe a fila.',
      'Serial vers OLT vers contrat — puis surveillez la file.',
      'Del serial a la OLT y al contrato; después mira la cola.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'NOC', 'Provisioning — ONUs'],
        [...turbo, 'NOC', 'Provisionamento — ONUs'],
        [...turbo, 'NOC', 'Provisionnement — ONU'],
        [...turbo, 'NOC', 'Aprovisionamiento — ONU'],
      ) },
      { type: 'steps', items: [
        { title: t('Match serial and contract', 'Case serial e contrato', 'Associez serial et contrat', 'Cuadra el serial con el contrato'), body: t(
          'The ONU belongs to a subscriber contract, not to “the OLT in general”. Wrong contract = wrong VLAN/speed.',
          'A ONU pertence a um contrato de assinante, não “à OLT em geral”. Contrato errado = VLAN/velocidade erradas.',
          'L’ONU appartient à un contrat abonné, pas « à l’OLT en général ». Mauvais contrat = VLAN/débit faux.',
          'La ONU pertenece a un contrato del abonado, no “a la OLT en general”. Contrato equivocado = VLAN y velocidad equivocadas.',
        ) },
        { title: t('Queue, do not stare at the OLT CLI', 'Fila, não fique no CLI da OLT', 'File, ne restez pas sur le CLI OLT', 'Usa la cola; no te quedes en la CLI de la OLT'), body: t(
          'Jobs retry with backoff. There is an operator Retry on the queue window if a job failed cleanly.',
          'Jobs retentam com backoff. Existe Retry do operador na janela da fila se o job falhou limpo.',
          'Les jobs retentent avec backoff. Il y a un bouton Réessayer pour l’opérateur sur la fenêtre de file si le job a échoué proprement.',
          'Los trabajos reintentan con espera creciente. Hay un botón Reintentar del operador en la ventana de la cola si el trabajo falló de forma limpia.',
        ) },
      ] },
      { type: 'related', slugs: ['add-olt', 'provisioning-queue', 'add-contract'] },
    ],
  },
  {
    slug: 'provisioning-queue',
    category: 'provisioning',
    minutes: 4,
    title: t('Watch the provisioning queue', 'Acompanhar a fila de provisionamento', 'Suivre la file de provisionnement', 'Seguir la cola de aprovisionamiento'),
    summary: t(
      'Pending, failed, retry — this is the truth, not the last SSH session.',
      'Pendente, falhou, retry — esta é a verdade, não o último SSH.',
      'En attente, échoué, Réessayer — c’est la vérité, pas la dernière session SSH.',
      'Pendiente, fallido, reintento: esa es la verdad, no la última sesión SSH.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'NOC', 'Provisioning — Queue'],
        [...turbo, 'NOC', 'Provisionamento — Fila'],
        [...turbo, 'NOC', 'Provisionnement — File'],
        [...turbo, 'NOC', 'Aprovisionamiento — Cola'],
      ) },
      { type: 'callout', kind: 'tip', text: t(
        'Deprovision is a first-class action in the same area. Do not delete the ONU from the OLT and leave the contract live.',
        'Desprovisionar é ação de primeira classe na mesma área. Não apague a ONU na OLT e deixe o contrato vivo.',
        'Le déprovisionnement est une action de premier plan dans la même zone. N’effacez pas l’ONU sur l’OLT en laissant le contrat en service.',
        'Desaprovisionar es una acción de primera clase en la misma zona. No borres la ONU en la OLT y dejes el contrato activo.',
      ) },
      { type: 'related', slugs: ['provision-onu'] },
    ],
  },
  {
    slug: 'noc-overview',
    category: 'noc',
    minutes: 5,
    title: t('NOC overview', 'Visão geral do NOC', 'Aperçu NOC', 'Vista general del NOC'),
    summary: t(
      'Fiber, wireless, FWA, devices, ACS — one place to see what is sick.',
      'Fibra, wireless, FWA, devices, ACS — um lugar para ver o que está doente.',
      'Fibre, sans fil, FWA, équipements, ACS — un endroit pour voir ce qui va mal.',
      'Fibra, inalámbrico, FWA, equipos y ACS: un solo lugar para ver qué está fallando.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'NOC', 'NOC Overview'],
        [...turbo, 'NOC', 'Visão geral do NOC'],
        [...turbo, 'NOC', 'Aperçu NOC'],
        [...turbo, 'NOC', 'Vista general del NOC'],
      ) },
      { type: 'p', text: t(
        'Alarms and polling are only as good as the device credentials. Rotate them in the device window — do not leave factory passwords.',
        'Alarmes e polling só são tão bons quanto as credenciais do device. Rotacione na janela do equipamento — não deixe senha de fábrica.',
        'Alarmes et polling ne valent que les identifiants device. Faites-les tourner dans la fenêtre équipement — pas de mot de passe usine.',
        'Las alarmas y el polling valen tanto como las credenciales del equipo. Rótalas en la ventana del equipo: no dejes contraseñas de fábrica.',
      ) },
      { type: 'related', slugs: ['disconnect-session', 'add-olt'] },
    ],
  },
  {
    slug: 'disconnect-session',
    category: 'noc',
    minutes: 4,
    title: t('Disconnect a session', 'Desconectar uma sessão', 'Déconnecter une session', 'Desconectar una sesión'),
    summary: t(
      'CoA Disconnect to the NAS. The worktop is not a substitute for UDP 3799 reaching the box.',
      'CoA Disconnect no NAS. O worktop não substitui UDP 3799 chegando na caixa.',
      'CoA Disconnect vers le NAS. Le worktop ne remplace pas l’UDP 3799 jusqu’à la boîte.',
      'CoA Disconnect hacia el NAS. El worktop no sustituye que el UDP 3799 llegue al equipo.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Subscribers', 'Client sessions'],
        [...turbo, 'Assinantes', 'Sessões de clientes'],
        [...turbo, 'Abonnés', 'Sessions clients'],
        [...turbo, 'Abonados', 'Sesiones de clientes'],
      ) },
      { type: 'callout', kind: 'warn', text: t(
        'If CoA returns CONFIG_ERROR, the NAS host/secret/port is wrong in RADIUS settings. Fix that before blaming the subscriber.',
        'Se o CoA voltar CONFIG_ERROR, host/secret/porta do NAS está errado no RADIUS. Arrume isso antes de culpar o assinante.',
        'Si CoA renvoie CONFIG_ERROR, hôte/secret/port NAS est faux dans RADIUS. Corrigez ça avant d’accuser l’abonné.',
        'Si el CoA devuelve CONFIG_ERROR, el host, el secreto o el puerto del NAS están mal en RADIUS. Corrígelo antes de culpar al abonado.',
      ) },
      { type: 'related', slugs: ['radius-nas', 'client-sessions', 'dunning'] },
    ],
  },
  {
    slug: 'customer-portal',
    category: 'portal',
    minutes: 5,
    title: t('Customer portal', 'Portal do cliente', 'Portail client', 'Portal del cliente'),
    summary: t(
      'Subscribers pay, open tickets, and see invoices on a separate login.',
      'Assinantes pagam, abrem chamados e veem faturas em um acesso próprio.',
      'Les abonnés paient, ouvrent des tickets et voient les factures avec un accès distinct.',
      'Los abonados pagan, abren tickets y ven las facturas con un acceso aparte.',
    ),
    body: [
      { type: 'p', text: t(
        'Portal URL is /{tenant}/portal-login. Staff worktop is /{tenant}/login. Mixing them is the #1 “I cannot see subscribers” report from new cashiers.',
        'URL do portal é /{tenant}/portal-login. Worktop da equipe é /{tenant}/login. Misturar os dois é o erro nº 1 de caixa novo.',
        'URL portail = /{tenant}/portal-login. Worktop de l’équipe = /{tenant}/login. Les mélanger est l’erreur n°1 des nouveaux caissiers.',
        'La URL del portal es /{tenant}/portal-login. El worktop del equipo es /{tenant}/login. Mezclarlas es el error n.º 1 de los cajeros nuevos.',
      ) },
      { type: 'steps', items: [
        { title: t('Set a portal password on the subscriber', 'Defina senha do portal no assinante', 'Définissez le mot de passe portail sur l’abonné', 'Define la contraseña del portal en el abonado'), body: t(
          'It is a field on create/edit — not a separate “portal user” module.',
          'É um campo no criar/editar — não um módulo separado de “usuário do portal”.',
          'C’est un champ à la création/édition — pas un module « utilisateur portail » séparé.',
          'Es un campo al crear o editar, no un módulo aparte de “usuario del portal”.',
        ) },
      ] },
      { type: 'related', slugs: ['create-subscriber', 'email-whatsapp'] },
    ],
  },
  {
    slug: 'email-whatsapp',
    category: 'portal',
    minutes: 5,
    title: t('Email and WhatsApp', 'E-mail e WhatsApp', 'Courriel et WhatsApp', 'Correo y WhatsApp'),
    summary: t(
      'Transactional mail and Cloud API WhatsApp. Not a marketing blast tool.',
      'E-mail transacional e WhatsApp Cloud API. Não é ferramenta de disparo de marketing.',
      'Courriel transactionnel et WhatsApp Cloud API. Pas un outil d’envoi marketing.',
      'Correo transaccional y WhatsApp Cloud API. No es una herramienta de envío de marketing.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Messenger'],
        [...turbo, 'Mensageiro'],
        [...turbo, 'Messagerie'],
        [...turbo, 'Mensajería'],
      ) },
      { type: 'p', text: t(
        'Departments, channels, and flows live under Messenger. Dunning that says “SMS” still uses WhatsApp Cloud on launch.',
        'Departamentos, canais e fluxos ficam no Mensageiro. Dunning que diz “SMS” ainda usa WhatsApp Cloud no lançamento.',
        'Départements, canaux et flux sont sous Messagerie. La relance dite « SMS » utilise encore WhatsApp Cloud au lancement.',
        'Departamentos, canales y flujos están en Mensajería. La cobranza que dice “SMS” igual sale por WhatsApp Cloud en el lanzamiento.',
      ) },
      { type: 'related', slugs: ['dunning', 'customer-portal'] },
    ],
  },
  {
    slug: 'reports',
    category: 'reports',
    minutes: 4,
    title: t('Reports', 'Relatórios', 'Rapports', 'Reportes'),
    summary: t(
      'Contracts, delinquents, system activity, regulatory extracts.',
      'Contratos, inadimplentes, atividade do sistema, extratos regulatórios.',
      'Contrats, impayés, activité système, extraits réglementaires.',
      'Contratos, morosos, actividad del sistema y extractos regulatorios.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Reports'],
        [...turbo, 'Relatórios'],
        [...turbo, 'Rapports'],
        [...turbo, 'Reportes'],
      ) },
      { type: 'ul', items: [
        t('Administrative: clients, contracts, delinquents.', 'Administrativo: clientes, contratos, inadimplentes.', 'Administratif: clients, contrats, impayés.', 'Administrativo: clientes, contratos, morosos.'),
        t('System activity for audit, not for NOC alarms.', 'Atividade do sistema para auditoria, não para alarme de NOC.', 'Activité système pour l’audit, pas pour les alarmes NOC.', 'Actividad del sistema para auditoría, no para alarmas del NOC.'),
        t('Regulatory extracts (e.g. SICI-style) when the tenant country requires them.', 'Extratos regulatórios (por exemplo, SICI) quando o país da operadora exige.', 'Extraits réglementaires lorsque le pays l’exige (au Brésil, par exemple le SICI).', 'Extractos regulatorios cuando el país de la operadora los exige (en Brasil, por ejemplo el SICI).'),
      ] },
      { type: 'related', slugs: ['generate-invoices', 'noc-overview'] },
    ],
  },
  {
    slug: 'global-settings',
    category: 'settings',
    minutes: 5,
    title: t('Global settings', 'Configurações globais', 'Paramètres globaux', 'Configuración global'),
    summary: t(
      'Locale, map keys, and tenant-wide defaults. Always scoped to this operator.',
      'Locale, chaves de mapa e padrões do tenant. Sempre deste operador.',
      'Locale, clés carte et défauts du tenant. Toujours cet opérateur.',
      'Idioma, claves de mapa y valores predeterminados del operador. Siempre limitados a este operador.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'General', 'Global settings'],
        [...turbo, 'Configurações', 'Geral', 'Configurações globais'],
        [...turbo, 'Paramètres', 'Général', 'Paramètres globaux'],
        [...turbo, 'Configuración', 'General', 'Configuración global'],
      ) },
      { type: 'p', text: t(
        'File storage, security, companies, and the migration assistant live under Settings as well. Superadmin-only tools are hidden from ordinary staff.',
        'Armazenamento de arquivos, segurança, empresas e o assistente de migração também ficam em Configurações. Ferramentas só de superadmin ficam ocultas da equipe comum.',
        'Stockage fichiers, sécurité, sociétés et assistant de migration sont aussi sous Paramètres. Les outils superadmin-only sont cachés à l’équipe ordinaire.',
        'El almacenamiento de archivos, la seguridad, las empresas y el asistente de migración también están en Configuración. Las herramientas solo de superadmin quedan ocultas para el equipo común.',
      ) },
      { type: 'related', slugs: ['map-api-keys', 'staff-and-permissions', 'setup-checklist'] },
    ],
  },
]
