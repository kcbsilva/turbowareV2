import type { Article } from './types'
import { t, trail } from './helpers'

const turbo = ['TurboMenu'] as const

export const startAndNetwork: Article[] = [
  {
    slug: 'first-login',
    category: 'start',
    minutes: 3,
    title: t('Sign in to the worktop', 'Entrar no worktop', 'Se connecter au worktop', 'Entrar al worktop'),
    summary: t(
      'How staff reach TurboISP, pick a tenant, and land on the worktop.',
      'Como a equipe acessa o TurboISP, escolhe o tenant e chega no worktop.',
      'Comment l’équipe atteint TurboISP, choisit le tenant et arrive sur le worktop.',
      'Cómo entra el equipo a TurboISP, elige un operador y llega al worktop.',
    ),
    body: [
      { type: 'p', text: t(
        'TurboISP is tenant-scoped. You do not get a global inbox of every ISP — you open one operator at a time.',
        'O TurboISP é por tenant. Não existe uma caixa global de todos os ISPs — você abre uma operadora por vez.',
        'TurboISP est limité au tenant. Pas de boîte globale de tous les FAI — vous ouvrez un opérateur à la fois.',
        'TurboISP está limitado al operador. No tienes una bandeja global de todos los ISP: abres un operador a la vez.',
      ) },
      { type: 'callout', kind: 'need', text: t(
        'Your tenant slug (the short name in the URL), staff email, and password. MFA if your tenant requires it.',
        'O slug do tenant (o nome curto na URL), e-mail da equipe e senha. MFA se o tenant exigir.',
        'Le slug du tenant (le nom court dans l’URL), le courriel de l’équipe et le mot de passe. MFA si le tenant l’exige.',
        'El slug del operador (el nombre corto en la URL), el correo del equipo y la contraseña. MFA si el operador lo exige.',
      ) },
      { type: 'steps', items: [
        { title: t('Open the tenant', 'Abrir o tenant', 'Ouvrir le tenant', 'Abre el operador'), body: t(
          'Go to the TurboISP app, enter the tenant slug, and continue. If the slug is wrong you land on the unavailable page — check spelling, not passwords.',
          'Abra o app TurboISP, informe o slug do tenant e continue. Slug errado cai na página de indisponível — confira a grafia, não a senha.',
          'Ouvrez l’app TurboISP, saisissez le slug du tenant et continuez. Un slug faux mène à la page indisponible — vérifiez l’orthographe, pas le mot de passe.',
          'Entra a la app de TurboISP, escribe el slug del operador y continúa. Si el slug está mal, caes en la página de no disponible: revisa la ortografía, no la contraseña.',
        ) },
        { title: t('Sign in as staff', 'Entrar com a conta da equipe', 'Se connecter comme membre de l’équipe', 'Entra con la cuenta del equipo'), body: t(
          'Use the staff login, not the customer portal. Portal login is a different URL under the same slug.',
          'Entre pela tela da equipe, não pelo portal do cliente. A entrada do portal é outra URL, no mesmo slug.',
          'Utilisez la connexion de l’équipe, pas le portail client. La connexion au portail est une autre URL sous le même slug.',
          'Usa el acceso del equipo, no el portal del cliente. La entrada del portal es otra URL, bajo el mismo slug.',
        ) },
        { title: t('Land on the worktop', 'Chegar no worktop', 'Arriver sur le worktop', 'Llega al worktop'), body: t(
          'Windows open from TurboMenu at the bottom of the screen. Nothing is a separate “module site” — it is all one desktop.',
          'As janelas abrem pelo TurboMenu na parte de baixo da tela. Não há um “site de módulo” separado — é uma área de trabalho só.',
          'Les fenêtres s’ouvrent depuis TurboMenu en bas de l’écran. Pas de « site module » séparé — un seul bureau.',
          'Las ventanas se abren desde TurboMenu, en la parte de abajo de la pantalla. No hay un “sitio de módulo” aparte: todo es un solo escritorio.',
        ) },
      ] },
      { type: 'related', slugs: ['setup-checklist', 'staff-and-permissions'] },
    ],
  },
  {
    slug: 'setup-checklist',
    category: 'start',
    minutes: 5,
    title: t('Walk the setup checklist', 'Percorrer o checklist de implantação', 'Parcourir la liste de mise en route', 'Recorrer la lista de puesta en marcha'),
    summary: t(
      'The in-app checklist is the order we expect a new tenant to complete.',
      'O checklist no app é a ordem que esperamos que um tenant novo conclua.',
      'La liste dans l’app est l’ordre à compléter pour un nouveau tenant.',
      'La lista dentro de la app es el orden que esperamos que complete un operador nuevo.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'General', 'Setup checklist'],
        [...turbo, 'Configurações', 'Geral', 'Checklist de implantação'],
        [...turbo, 'Paramètres', 'Général', 'Liste de mise en route'],
        [...turbo, 'Configuración', 'General', 'Lista de puesta en marcha'],
      ) },
      { type: 'p', text: t(
        'Do not skip POP, plans, and a payment gateway and then wonder why invoices or the map look empty.',
        'Não pule POP, planos e um gateway de pagamento e depois estranhe faturas ou mapa vazios.',
        'Ne sautez pas POP, forfaits et passerelle de paiement, puis ne vous étonnez pas que factures ou carte soient vides.',
        'No te saltes el POP, los planes ni una pasarela de pago para después preguntarte por qué las facturas o el mapa salen vacíos.',
      ) },
      { type: 'steps', items: [
        { title: t('Open the checklist', 'Abrir o checklist', 'Ouvrir la liste', 'Abre la lista'), body: t(
          'Each row is a real window. Click through and mark what you already configured.',
          'Cada linha é uma janela de verdade. Clique e marque o que já configurou.',
          'Chaque ligne est une vraie fenêtre. Cliquez et cochez ce qui est déjà configuré.',
          'Cada fila es una ventana de verdad. Ábrela y marca lo que ya configuraste.',
        ) },
        { title: t('Finish identity first', 'Identidade primeiro', 'Identité d’abord', 'Completa la identidad primero'), body: t(
          'Company, POP, users, then network. Billing and map keys come after you have somewhere for customers to live.',
          'Empresa, POP, usuários, depois rede. Faturamento e chaves de mapa vêm depois de ter onde o cliente mora.',
          'Société, POP, utilisateurs, puis réseau. Facturation et clés carte viennent après un lieu pour les clients.',
          'Empresa, POP, usuarios y luego la red. La facturación y las claves del mapa vienen cuando ya hay un lugar donde viva el cliente.',
        ) },
      ] },
      { type: 'related', slugs: ['create-pop', 'global-settings'] },
    ],
  },
  {
    slug: 'create-pop',
    category: 'start',
    minutes: 6,
    title: t('Register a POP', 'Cadastrar um POP', 'Enregistrer un POP', 'Registrar un POP'),
    summary: t(
      'A Point of Presence is the site the rest of the operation hangs from — plans, RADIUS, and the map.',
      'O ponto de presença é o local do qual o resto da operação depende — planos, RADIUS e o mapa.',
      'Le point de présence est le site auquel le reste de l’opération se rattache — forfaits, RADIUS et carte.',
      'El punto de presencia es el sitio del que depende el resto de la operación: planes, RADIUS y el mapa.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'System', 'POPs'],
        [...turbo, 'Configurações', 'Sistema', 'POPs'],
        [...turbo, 'Paramètres', 'Système', 'POPs'],
        [...turbo, 'Configuración', 'Sistema', 'POPs'],
      ) },
      { type: 'callout', kind: 'need', text: t(
        'A company record, a city, and which country this POP bills in (Brazil vs Canada changes tax, currency, and bureau tools).',
        'Um cadastro de empresa, uma cidade e o país de faturamento do POP (Brasil vs Canadá muda imposto, moeda e birô).',
        'Une société, une ville, et le pays de facturation du POP (Brésil vs Canada change taxe, devise et bureau de crédit).',
        'Una ficha de empresa, una ciudad y el país en el que este POP factura (Brasil o Canadá: cambia el impuesto, la moneda y las herramientas del buró de crédito).',
      ) },
      { type: 'steps', items: [
        { title: t('Create the company if it is missing', 'Crie a empresa se faltar', 'Créez la société si elle manque', 'Crea la empresa si falta'), body: t(
          'Settings → System → Companies. The POP belongs to a company, not to a random staff user.',
          'Configurações → Sistema → Empresas. O POP pertence a uma empresa, não a um usuário solto.',
          'Paramètres → Système → Sociétés. Le POP appartient à une société, pas à un utilisateur isolé.',
          'Configuración → Sistema → Empresas. El POP pertenece a una empresa, no a un usuario cualquiera del equipo.',
        ) },
        { title: t('Add the POP', 'Adicione o POP', 'Ajoutez le POP', 'Agrega el POP'), body: t(
          'Name it the way the NOC says it on the radio — “POP Centro”, not an internal ticket number.',
          'Nomeie como o NOC fala no rádio — “POP Centro”, não um número de chamado interno.',
          'Nommez-le comme le NOC le dit à la radio — « POP Centre », pas un numéro de billet interne.',
          'Ponle el nombre como lo dice el NOC por radio: “POP Centro”, no un número de ticket interno.',
        ) },
        { title: t('Switch the active POP', 'Troque o POP ativo', 'Changez le POP actif', 'Cambia el POP activo'), body: t(
          'The worktop is scoped to the active POP. If the map or subscribers look wrong, check the POP switcher first.',
          'O worktop fica limitado ao POP ativo. Se o mapa ou os assinantes parecerem errados, veja o seletor de POP primeiro.',
          'Le worktop est propre au POP actif. Si la carte ou les abonnés semblent faux, vérifiez d’abord le sélecteur de POP.',
          'El worktop queda limitado al POP activo. Si el mapa o los abonados se ven mal, revisa primero el selector de POP.',
        ) },
      ] },
      { type: 'related', slugs: ['radius-nas', 'map-api-keys'] },
    ],
  },
  {
    slug: 'staff-and-permissions',
    category: 'start',
    minutes: 7,
    title: t('Users and permission groups', 'Usuários e grupos de permissão', 'Utilisateurs et groupes de permission', 'Usuarios y grupos de permisos'),
    summary: t(
      'Staff see TurboMenu items only if their group allows the page.',
      'A equipe só vê itens do TurboMenu se o grupo permitir a página.',
      'L’équipe ne voit les éléments du TurboMenu que si le groupe autorise la page.',
      'El equipo solo ve los ítems de TurboMenu si su grupo permite la página.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'Users', 'User groups'],
        [...turbo, 'Configurações', 'Usuários', 'Grupos de usuários'],
        [...turbo, 'Paramètres', 'Utilisateurs', 'Groupes d’utilisateurs'],
        [...turbo, 'Configuración', 'Usuarios', 'Grupos de usuarios'],
      ) },
      { type: 'steps', items: [
        { title: t('Create a group', 'Crie um grupo', 'Créez un groupe', 'Crea un grupo'), body: t(
          'Finance, NOC, field, and front-desk should not share one admin group. Clone a tight group and add pages.',
          'Financeiro, NOC, campo e recepção não devem compartilhar um grupo admin. Clone um grupo fechado e acrescente páginas.',
          'Finance, NOC, terrain et accueil ne doivent pas partager un groupe admin. Clonez un groupe serré et ajoutez des pages.',
          'Finanzas, NOC, campo y recepción no deben compartir un mismo grupo admin. Clona un grupo cerrado y agrega páginas.',
        ) },
        { title: t('Tick the pages they need', 'Marque as páginas que precisam', 'Cochez les pages nécessaires', 'Marca las páginas que necesitan'), body: t(
          'Permissions are page-level (subscribers create, invoices, map, and so on). A missing menu item is almost always the group, not a bug.',
          'As permissões são por página (criar assinantes, faturas, mapa etc.). Item de menu sumido quase sempre é o grupo, não um bug.',
          'Les permissions sont par page (créer abonnés, factures, carte…). Un item de menu manquant est presque toujours le groupe, pas un bug.',
          'Los permisos son por página (crear abonados, facturas, mapa, etc.). Si falta un ítem del menú, casi siempre es el grupo, no un bug.',
        ) },
        { title: t('Add the user', 'Adicione o usuário', 'Ajoutez l’utilisateur', 'Agrega el usuario'), body: t(
          'Settings → Users → Users list. Assign the group. Admins and superadmins bypass a lot of this — do not make everyone admin.',
          'Configurações → Usuários → Lista de usuários. Atribua o grupo. Admins e superadmins passam por cima de muita coisa — não transforme todo mundo em admin.',
          'Paramètres → Utilisateurs → Liste des utilisateurs. Assignez le groupe. Admins et superadmins contournent beaucoup de ça — ne rendez pas tout le monde admin.',
          'Configuración → Usuarios → Lista de usuarios. Asigna el grupo. Los admins y superadmins se saltan gran parte de esto: no hagas admin a todo el mundo.',
        ) },
      ] },
      { type: 'callout', kind: 'warn', text: t(
        'Map API keys stay in tenant settings and are stripped for non-admins on GET. Do not paste keys into Slack or the wiki.',
        'Chaves de mapa ficam nas configurações do tenant e são omitidas para não-admins no GET. Não cole chaves no Slack nem no wiki.',
        'Les clés de carte restent dans les paramètres du tenant et sont masquées pour les non-admins au GET. Ne collez pas de clés dans Slack ni dans le wiki.',
        'Las claves del mapa quedan en la configuración del operador y se omiten para quien no es admin en el GET. No pegues claves en Slack ni en el wiki.',
      ) },
      { type: 'related', slugs: ['first-login', 'global-settings'] },
    ],
  },
  {
    slug: 'radius-nas',
    category: 'network',
    minutes: 8,
    title: t('RADIUS and NAS', 'RADIUS e NAS', 'RADIUS et NAS', 'RADIUS y NAS'),
    summary: t(
      'Point the concentrator at TurboRADIUS and keep sessions visible in the worktop.',
      'Aponte o concentrador para o TurboRADIUS e mantenha as sessões visíveis no worktop.',
      'Pointez le concentrateur vers TurboRADIUS et gardez les sessions visibles sur le worktop.',
      'Apunta el concentrador a TurboRADIUS y mantén las sesiones visibles en el worktop.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'Network', 'RADIUS'],
        [...turbo, 'Configurações', 'Rede', 'RADIUS'],
        [...turbo, 'Paramètres', 'Réseau', 'RADIUS'],
        [...turbo, 'Configuración', 'Red', 'RADIUS'],
      ) },
      { type: 'p', text: t(
        'NAS here means the box that authenticates subscribers (MikroTik, Accel-PPP, and similar) — not a storage appliance.',
        'NAS aqui é o equipamento que autentica os assinantes (MikroTik, Accel-PPP e similares) — não um servidor de armazenamento.',
        'NAS ici, c’est la boîte qui authentifie les abonnés (MikroTik, Accel-PPP et similaires) — pas une baie de stockage.',
        'Aquí NAS es el equipo que autentica a los abonados (MikroTik, Accel-PPP y similares), no un servidor de almacenamiento.',
      ) },
      { type: 'steps', items: [
        { title: t('Register the NAS', 'Cadastre o NAS', 'Enregistrez le NAS', 'Registra el NAS'), body: t(
          'Host, secret, and CoA port (UDP 3799) if you will disconnect or change speed from the worktop.',
          'Host, segredo e porta CoA (UDP 3799) se for desconectar ou mudar a velocidade pelo worktop.',
          'Hôte, secret et port CoA (UDP 3799) si vous déconnectez ou changez le débit depuis le worktop.',
          'Host, secreto y puerto CoA (UDP 3799) si vas a desconectar o cambiar la velocidad desde el worktop.',
        ) },
        { title: t('Confirm live sessions', 'Confirme sessões ao vivo', 'Confirmez les sessions en direct', 'Confirma las sesiones en vivo'), body: t(
          'TurboMenu → Subscribers → Client sessions. Empty after a known-online customer means RADIUS never accounted the session — secrets and NAS IP first, not the subscriber record.',
          'TurboMenu → Assinantes → Sessões de clientes. Vazio com cliente online conhecido: o RADIUS não contabilizou a sessão — segredo e IP do NAS primeiro, não o cadastro.',
          'TurboMenu → Abonnés → Sessions clients. Vide alors que le client est en ligne: RADIUS n’a pas compté — secret et IP du NAS d’abord, pas la fiche abonné.',
          'TurboMenu → Abonados → Sesiones de clientes. Si quedan vacías con un cliente que sabes que está en línea, RADIUS no contabilizó la sesión: primero el secreto y la IP del NAS, no la ficha del abonado.',
        ) },
      ] },
      { type: 'related', slugs: ['client-sessions', 'disconnect-session', 'ip-blocks'] },
    ],
  },
  {
    slug: 'ip-blocks',
    category: 'network',
    minutes: 6,
    title: t('IP blocks and pools', 'Blocos de IP e pools', 'Blocs IP et pools', 'Bloques de IP y pools'),
    summary: t(
      'Hand out public or CGNAT space from pools, not from a spreadsheet.',
      'Distribua espaço público ou CGNAT a partir de pools, não de planilha.',
      'Attribuez l’espace public ou CGNAT depuis des pools, pas un tableur.',
      'Reparte espacio público o CGNAT desde pools, no desde una hoja de cálculo.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'Network', 'IP blocks'],
        [...turbo, 'Configurações', 'Rede', 'Blocos de IP'],
        [...turbo, 'Paramètres', 'Réseau', 'Blocs IP'],
        [...turbo, 'Configuración', 'Red', 'Bloques de IP'],
      ) },
      { type: 'steps', items: [
        { title: t('Create the block', 'Crie o bloco', 'Créez le bloc', 'Crea el bloque'), body: t(
          'Prefix, POP, and whether it is public or CGNAT. Contracts pull from a pool — they do not invent addresses.',
          'Prefixo, POP e se é público ou CGNAT. Contratos puxam de um pool — não inventam endereço.',
          'Préfixe, POP, et public ou CGNAT. Les contrats tirent d’un pool — ils n’inventent pas d’adresse.',
          'Prefijo, POP y si es público o CGNAT. Los contratos toman la dirección de un pool: no inventan direcciones.',
        ) },
        { title: t('Attach on the contract', 'Vincule no contrato', 'Attachez au contrat', 'Vincúlalo al contrato'), body: t(
          'Fixed IP on a contract is a pool pick or a manual pin — both live on the subscriber contract, not only on the MikroTik.',
          'IP fixo no contrato é escolha de pool ou reserva manual — os dois vivem no contrato do assinante, não só no MikroTik.',
          'L’IP fixe du contrat est un choix de pool ou une réservation manuelle — les deux vivent sur le contrat de l’abonné, pas seulement sur le MikroTik.',
          'La IP fija del contrato es una elección del pool o una reserva manual: las dos viven en el contrato del abonado, no solo en el MikroTik.',
        ) },
      ] },
      { type: 'related', slugs: ['cgnat', 'add-contract'] },
    ],
  },
  {
    slug: 'cgnat',
    category: 'network',
    minutes: 5,
    title: t('CGNAT ranges', 'Faixas CGNAT', 'Plages CGNAT', 'Rangos CGNAT'),
    summary: t(
      'Generate paste-ready CGNAT config from the tenant, then keep the pool in TurboISP as the source of truth.',
      'Gere config CGNAT pronta para colar a partir do tenant, e mantenha o pool no TurboISP como fonte da verdade.',
      'Générez une config CGNAT à coller depuis le tenant, et gardez le pool TurboISP comme source de vérité.',
      'Genera una config de CGNAT lista para pegar a partir del operador, y deja el pool en TurboISP como fuente de verdad.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'Network', 'CGNAT'],
        [...turbo, 'Configurações', 'Rede', 'CGNAT'],
        [...turbo, 'Paramètres', 'Réseau', 'CGNAT'],
        [...turbo, 'Configuración', 'Red', 'CGNAT'],
      ) },
      { type: 'callout', kind: 'tip', text: t(
        'The generator is for the router. TurboISP still needs the matching IP block so contracts and sessions agree.',
        'O gerador é para o roteador. O TurboISP ainda precisa do bloco de IP correspondente para contrato e sessão baterem.',
        'Le générateur est pour le routeur. TurboISP a encore besoin du bloc IP correspondant pour que contrat et session s’accordent.',
        'El generador es para el router. TurboISP todavía necesita el bloque de IP correspondiente para que el contrato y la sesión coincidan.',
      ) },
      { type: 'related', slugs: ['ip-blocks', 'radius-nas'] },
    ],
  },
]
