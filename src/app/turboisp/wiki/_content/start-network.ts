import type { Article } from './types'
import { t, trail } from './helpers'

const turbo = ['TurboMenu'] as const

export const startAndNetwork: Article[] = [
  {
    slug: 'first-login',
    category: 'start',
    minutes: 3,
    title: t('Sign in to the worktop', 'Entrar no worktop', 'Se connecter au worktop'),
    summary: t(
      'How staff reach TurboISP, pick a tenant, and land on the worktop.',
      'Como a equipe acessa o TurboISP, escolhe o tenant e chega no worktop.',
      'Comment l’équipe atteint TurboISP, choisit le tenant et arrive sur le worktop.',
    ),
    body: [
      { type: 'p', text: t(
        'TurboISP is tenant-scoped. You do not get a global inbox of every ISP — you open one operator at a time.',
        'O TurboISP é por tenant. Não existe uma caixa global de todos os ISPs — você abre uma operadora por vez.',
        'TurboISP est scopé par tenant. Pas de boîte globale de tous les FAI — vous ouvrez un opérateur à la fois.',
      ) },
      { type: 'callout', kind: 'need', text: t(
        'Your tenant slug (the short name in the URL), staff email, and password. MFA if your tenant requires it.',
        'O slug do tenant (o nome curto na URL), e-mail da equipe e senha. MFA se o tenant exigir.',
        'Le slug du tenant (le nom court dans l’URL), e-mail staff et mot de passe. MFA si le tenant l’exige.',
      ) },
      { type: 'steps', items: [
        { title: t('Open the tenant', 'Abrir o tenant', 'Ouvrir le tenant'), body: t(
          'Go to the TurboISP app, enter the tenant slug, and continue. If the slug is wrong you land on the unavailable page — check spelling, not passwords.',
          'Abra o app TurboISP, informe o slug do tenant e continue. Slug errado cai na página de indisponível — confira a grafia, não a senha.',
          'Ouvrez l’app TurboISP, saisissez le slug du tenant et continuez. Un slug faux mène à la page indisponible — vérifiez l’orthographe, pas le mot de passe.',
        ) },
        { title: t('Sign in as staff', 'Entrar como equipe', 'Se connecter en staff'), body: t(
          'Use the staff login, not the customer portal. Portal login is a different URL under the same slug.',
          'Use o login da equipe, não o portal do cliente. O portal é outra URL no mesmo slug.',
          'Utilisez le login staff, pas le portail client. Le portail est une autre URL sous le même slug.',
        ) },
        { title: t('Land on the worktop', 'Chegar no worktop', 'Arriver sur le worktop'), body: t(
          'Windows open from TurboMenu at the bottom of the screen. Nothing is a separate “module site” — it is all one desktop.',
          'As janelas abrem pelo TurboMenu na parte de baixo. Não há um “site de módulo” separado — é um desktop só.',
          'Les fenêtres s’ouvrent depuis TurboMenu en bas de l’écran. Pas de « site module » séparé — un seul bureau.',
        ) },
      ] },
      { type: 'related', slugs: ['setup-checklist', 'staff-and-permissions'] },
    ],
  },
  {
    slug: 'setup-checklist',
    category: 'start',
    minutes: 5,
    title: t('Walk the setup checklist', 'Seguir o checklist de setup', 'Suivre la checklist de setup'),
    summary: t(
      'The in-app checklist is the order we expect a new tenant to complete.',
      'O checklist no app é a ordem que esperamos de um tenant novo.',
      'La checklist dans l’app est l’ordre attendu pour un nouveau tenant.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'General', 'Setup checklist'],
        [...turbo, 'Configurações', 'Geral', 'Checklist de setup'],
        [...turbo, 'Paramètres', 'Général', 'Checklist de setup'],
      ) },
      { type: 'p', text: t(
        'Do not skip POP, plans, and a payment gateway and then wonder why invoices or the map look empty.',
        'Não pule POP, planos e um gateway de pagamento e depois estranhe faturas ou mapa vazios.',
        'Ne sautez pas POP, forfaits et passerelle de paiement, puis ne vous étonnez pas que factures ou carte soient vides.',
      ) },
      { type: 'steps', items: [
        { title: t('Open the checklist', 'Abrir o checklist', 'Ouvrir la checklist'), body: t(
          'Each row is a real window. Click through and mark what you already configured.',
          'Cada linha é uma janela de verdade. Clique e marque o que já configurou.',
          'Chaque ligne est une vraie fenêtre. Cliquez et cochez ce qui est déjà configuré.',
        ) },
        { title: t('Finish identity first', 'Identidade primeiro', 'Identité d’abord'), body: t(
          'Company, POP, users, then network. Billing and map keys come after you have somewhere for customers to live.',
          'Empresa, POP, usuários, depois rede. Billing e chaves de mapa vêm depois de ter onde o cliente mora.',
          'Société, POP, utilisateurs, puis réseau. Facturation et clés carte viennent après un lieu pour les clients.',
        ) },
      ] },
      { type: 'related', slugs: ['create-pop', 'global-settings'] },
    ],
  },
  {
    slug: 'create-pop',
    category: 'start',
    minutes: 6,
    title: t('Register a POP', 'Cadastrar um POP', 'Enregistrer un POP'),
    summary: t(
      'A Point of Presence is the site the rest of the operation hangs from — plans, RADIUS, and the map.',
      'O Ponto de Presença é o site do qual o resto da operação pende — planos, RADIUS e o mapa.',
      'Le Point of Presence est le site auquel le reste de l’opération se rattache — forfaits, RADIUS et carte.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'System', 'POPs'],
        [...turbo, 'Configurações', 'Sistema', 'POPs'],
        [...turbo, 'Paramètres', 'Système', 'POPs'],
      ) },
      { type: 'callout', kind: 'need', text: t(
        'A company record, a city, and which country this POP bills in (Brazil vs Canada changes tax, currency, and bureau tools).',
        'Um cadastro de empresa, uma cidade e o país de faturamento do POP (Brasil vs Canadá muda imposto, moeda e birô).',
        'Une société, une ville, et le pays de facturation du POP (Brésil vs Canada change taxe, devise et bureau de crédit).',
      ) },
      { type: 'steps', items: [
        { title: t('Create the company if it is missing', 'Crie a empresa se faltar', 'Créez la société si elle manque'), body: t(
          'Settings → System → Companies. The POP belongs to a company, not to a random staff user.',
          'Configurações → Sistema → Empresas. O POP pertence a uma empresa, não a um usuário solto.',
          'Paramètres → Système → Sociétés. Le POP appartient à une société, pas à un utilisateur isolé.',
        ) },
        { title: t('Add the POP', 'Adicione o POP', 'Ajoutez le POP'), body: t(
          'Name it the way the NOC says it on the radio — “POP Centro”, not an internal ticket number.',
          'Nomeie como o NOC fala no rádio — “POP Centro”, não um número de ticket interno.',
          'Nommez-le comme le NOC le dit à la radio — « POP Centre », pas un numéro de ticket interne.',
        ) },
        { title: t('Switch the active POP', 'Troque o POP ativo', 'Changez le POP actif'), body: t(
          'The worktop is scoped to the active POP. If the map or subscribers look wrong, check the POP switcher first.',
          'O worktop é no POP ativo. Se o mapa ou os assinantes parecerem errados, veja o seletor de POP primeiro.',
          'Le worktop est scopé au POP actif. Si la carte ou les abonnés semblent faux, vérifiez d’abord le sélecteur de POP.',
        ) },
      ] },
      { type: 'related', slugs: ['radius-nas', 'map-api-keys'] },
    ],
  },
  {
    slug: 'staff-and-permissions',
    category: 'start',
    minutes: 7,
    title: t('Users and permission groups', 'Usuários e grupos de permissão', 'Utilisateurs et groupes de permission'),
    summary: t(
      'Staff see TurboMenu items only if their group allows the page.',
      'A equipe só vê itens do TurboMenu se o grupo permitir a página.',
      'Le staff ne voit les items TurboMenu que si le groupe autorise la page.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'Users', 'User groups'],
        [...turbo, 'Configurações', 'Usuários', 'Grupos de usuários'],
        [...turbo, 'Paramètres', 'Utilisateurs', 'Groupes d’utilisateurs'],
      ) },
      { type: 'steps', items: [
        { title: t('Create a group', 'Crie um grupo', 'Créez un groupe'), body: t(
          'Finance, NOC, field, and front-desk should not share one admin group. Clone a tight group and add pages.',
          'Financeiro, NOC, campo e recepção não devem compartilhar um grupo admin. Clone um grupo fechado e acrescente páginas.',
          'Finance, NOC, terrain et accueil ne doivent pas partager un groupe admin. Clonez un groupe serré et ajoutez des pages.',
        ) },
        { title: t('Tick the pages they need', 'Marque as páginas que precisam', 'Cochez les pages nécessaires'), body: t(
          'Permissions are page-level (subscribers create, invoices, map, and so on). A missing menu item is almost always the group, not a bug.',
          'As permissões são por página (criar assinantes, faturas, mapa etc.). Item de menu sumido quase sempre é o grupo, não um bug.',
          'Les permissions sont par page (créer abonnés, factures, carte…). Un item de menu manquant est presque toujours le groupe, pas un bug.',
        ) },
        { title: t('Add the user', 'Adicione o usuário', 'Ajoutez l’utilisateur'), body: t(
          'Settings → Users → Users list. Assign the group. Admins and superadmins bypass a lot of this — do not make everyone admin.',
          'Configurações → Usuários → Lista. Atribua o grupo. Admins e superadmins passam por cima de muita coisa — não transforme todo mundo em admin.',
          'Paramètres → Utilisateurs → Liste. Assignez le groupe. Admins et superadmins contournent beaucoup de ça — ne rendez pas tout le monde admin.',
        ) },
      ] },
      { type: 'callout', kind: 'warn', text: t(
        'Map API keys stay in tenant settings and are stripped for non-admins on GET. Do not paste keys into Slack or the wiki.',
        'Chaves de mapa ficam nas settings do tenant e são omitidas para não-admins no GET. Não cole chaves no Slack ou no wiki.',
        'Les clés carte restent dans les settings du tenant et sont masquées pour les non-admins au GET. Ne collez pas de clés dans Slack ou le wiki.',
      ) },
      { type: 'related', slugs: ['first-login', 'global-settings'] },
    ],
  },
  {
    slug: 'radius-nas',
    category: 'network',
    minutes: 8,
    title: t('RADIUS and NAS', 'RADIUS e NAS', 'RADIUS et NAS'),
    summary: t(
      'Point the concentrator at TurboRADIUS and keep sessions visible in the worktop.',
      'Aponte o concentrador para o TurboRADIUS e mantenha as sessões visíveis no worktop.',
      'Pointez le concentrateur vers TurboRADIUS et gardez les sessions visibles sur le worktop.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'Network', 'RADIUS'],
        [...turbo, 'Configurações', 'Rede', 'RADIUS'],
        [...turbo, 'Paramètres', 'Réseau', 'RADIUS'],
      ) },
      { type: 'p', text: t(
        'NAS here means the box that authenticates subscribers (MikroTik, Accel-PPP, and similar) — not a storage appliance.',
        'NAS aqui é o equipamento que autentica assinantes (MikroTik, Accel-PPP e similares) — não um storage.',
        'NAS ici = la boîte qui authentifie les abonnés (MikroTik, Accel-PPP…) — pas un baie de stockage.',
      ) },
      { type: 'steps', items: [
        { title: t('Register the NAS', 'Cadastre o NAS', 'Enregistrez le NAS'), body: t(
          'Host, secret, and CoA port (UDP 3799) if you will disconnect or change speed from the worktop.',
          'Host, secret e porta CoA (UDP 3799) se for desconectar ou mudar velocidade pelo worktop.',
          'Hôte, secret et port CoA (UDP 3799) si vous déconnectez ou changez le débit depuis le worktop.',
        ) },
        { title: t('Confirm live sessions', 'Confirme sessões ao vivo', 'Confirmez les sessions live'), body: t(
          'TurboMenu → Subscribers → Client sessions. Empty after a known-online customer means RADIUS never accounted the session — secrets and NAS IP first, not the subscriber record.',
          'TurboMenu → Assinantes → Sessões de clientes. Vazio com cliente online conhecido: o RADIUS não contabilizou — segredo e IP do NAS primeiro, não o cadastro.',
          'TurboMenu → Abonnés → Sessions clients. Vide alors que le client est en ligne : RADIUS n’a pas compté — secret et IP NAS d’abord, pas la fiche abonné.',
        ) },
      ] },
      { type: 'related', slugs: ['client-sessions', 'disconnect-session', 'ip-blocks'] },
    ],
  },
  {
    slug: 'ip-blocks',
    category: 'network',
    minutes: 6,
    title: t('IP blocks and pools', 'Blocos de IP e pools', 'Blocs IP et pools'),
    summary: t(
      'Hand out public or CGNAT space from pools, not from a spreadsheet.',
      'Distribua espaço público ou CGNAT a partir de pools, não de planilha.',
      'Attribuez l’espace public ou CGNAT depuis des pools, pas un tableur.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'Network', 'IP blocks'],
        [...turbo, 'Configurações', 'Rede', 'Blocos de IP'],
        [...turbo, 'Paramètres', 'Réseau', 'Blocs IP'],
      ) },
      { type: 'steps', items: [
        { title: t('Create the block', 'Crie o bloco', 'Créez le bloc'), body: t(
          'Prefix, POP, and whether it is public or CGNAT. Contracts pull from a pool — they do not invent addresses.',
          'Prefixo, POP e se é público ou CGNAT. Contratos puxam de um pool — não inventam endereço.',
          'Préfixe, POP, et public ou CGNAT. Les contrats tirent d’un pool — ils n’inventent pas d’adresse.',
        ) },
        { title: t('Attach on the contract', 'Vincule no contrato', 'Attachez au contrat'), body: t(
          'Fixed IP on a contract is a pool pick or a manual pin — both live on the subscriber contract, not only on the MikroTik.',
          'IP fixo no contrato é escolha de pool ou pin manual — os dois vivem no contrato do assinante, não só no MikroTik.',
          'IP fixe sur le contrat = choix de pool ou pin manuel — les deux vivent sur le contrat abonné, pas seulement sur le MikroTik.',
        ) },
      ] },
      { type: 'related', slugs: ['cgnat', 'add-contract'] },
    ],
  },
  {
    slug: 'cgnat',
    category: 'network',
    minutes: 5,
    title: t('CGNAT ranges', 'Faixas CGNAT', 'Plages CGNAT'),
    summary: t(
      'Generate paste-ready CGNAT config from the tenant, then keep the pool in TurboISP as the source of truth.',
      'Gere config CGNAT pronta para colar a partir do tenant, e mantenha o pool no TurboISP como fonte da verdade.',
      'Générez une config CGNAT à coller depuis le tenant, et gardez le pool TurboISP comme source de vérité.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'Network', 'CGNAT'],
        [...turbo, 'Configurações', 'Rede', 'CGNAT'],
        [...turbo, 'Paramètres', 'Réseau', 'CGNAT'],
      ) },
      { type: 'callout', kind: 'tip', text: t(
        'The generator is for the router. TurboISP still needs the matching IP block so contracts and sessions agree.',
        'O gerador é para o roteador. O TurboISP ainda precisa do bloco de IP correspondente para contrato e sessão baterem.',
        'Le générateur est pour le routeur. TurboISP a encore besoin du bloc IP correspondant pour que contrat et session s’accordent.',
      ) },
      { type: 'related', slugs: ['ip-blocks', 'radius-nas'] },
    ],
  },
]
