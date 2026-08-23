import type { Article } from './types'
import { t, trail } from './helpers'

const turbo = ['TurboMenu'] as const

export const mapPlansCustomers: Article[] = [
  {
    slug: 'map-api-keys',
    category: 'map',
    minutes: 4,
    title: t('Put map keys on the tenant', 'Colocar chaves de mapa no tenant', 'Mettre les clés carte sur le tenant'),
    summary: t(
      'Google Maps, Mapbox, and HERE keys live in this tenant’s global settings — never in a shared env file.',
      'Chaves Google Maps, Mapbox e HERE ficam nas settings globais deste tenant — nunca num .env compartilhado.',
      'Les clés Google Maps, Mapbox et HERE vivent dans les settings globaux de ce tenant — jamais dans un .env partagé.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'General', 'Global settings'],
        [...turbo, 'Configurações', 'Geral', 'Configurações globais'],
        [...turbo, 'Paramètres', 'Général', 'Paramètres globaux'],
      ) },
      { type: 'steps', items: [
        { title: t('Paste only this tenant’s key', 'Cole só a chave deste tenant', 'Collez uniquement la clé de ce tenant'), body: t(
          'Admins see the fields. Non-admins get them stripped on GET. Switching tenant must not reuse the previous operator’s tiles.',
          'Admins veem os campos. Não-admins recebem os valores omitidos no GET. Trocar de tenant não pode reusar o mapa do operador anterior.',
          'Les admins voient les champs. Les non-admins les reçoivent masqués au GET. Changer de tenant ne doit pas réutiliser les tuiles de l’opérateur précédent.',
        ) },
        { title: t('Open the map to confirm tiles', 'Abra o mapa para confirmar as tiles', 'Ouvrez la carte pour confirmer les tuiles'), body: t(
          'Infrastructure → Map. If the basemap is blank, the key is missing, restricted to the wrong HTTP referrer, or belongs to another cloud project.',
          'Infraestrutura → Mapa. Basemap em branco: chave ausente, referrer HTTP errado, ou projeto de nuvem errado.',
          'Infrastructure → Carte. Fond blanc : clé absente, referrer HTTP faux, ou mauvais projet cloud.',
        ) },
      ] },
      { type: 'callout', kind: 'warn', text: t(
        'Do not store map keys in localStorage as the source of truth. The API is scoped by tenant_id.',
        'Não use localStorage como fonte da verdade para chaves de mapa. A API é por tenant_id.',
        'Ne stockez pas les clés carte dans localStorage comme source de vérité. L’API est scopée par tenant_id.',
      ) },
      { type: 'related', slugs: ['network-map', 'import-kml'] },
    ],
  },
  {
    slug: 'network-map',
    category: 'map',
    minutes: 8,
    title: t('Work the network map', 'Usar o mapa de rede', 'Utiliser la carte réseau'),
    summary: t(
      'Poles, cables, splitters, FDH/CTO, and subscribers on one GIS canvas.',
      'Postes, cabos, splitters, FDH/CTO e assinantes num canvas GIS.',
      'Poteaux, câbles, splitters, FDH/CTO et abonnés sur un canvas SIG.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Infrastructure', 'Map'],
        [...turbo, 'Infraestrutura', 'Mapa'],
        [...turbo, 'Infrastructure', 'Carte'],
      ) },
      { type: 'steps', items: [
        { title: t('Pick a layer, then draw', 'Escolha a camada e desenhe', 'Choisissez une couche, puis dessinez'), body: t(
          'The toolbar is the inventory type you are placing. Click a feature to open detail, uploads, and comments.',
          'A toolbar é o tipo de inventário que você está colocando. Clique num feature para detalhe, uploads e comentários.',
          'La barre d’outils est le type d’inventaire que vous placez. Cliquez une entité pour détail, uploads et commentaires.',
        ) },
        { title: t('Keep plant in projects', 'Mantenha a planta em projetos', 'Gardez la plante dans des projets'), body: t(
          'OSP hangs off tenant → project → phase. Do not dump every pole into a scratch layer you cannot report on.',
          'OSP pende de tenant → projeto → fase. Não jogue todo poste numa camada solta que não vira relatório.',
          'L’OSP se rattache tenant → projet → phase. Ne jetez pas chaque poteau dans une couche jetable inutilisable en rapport.',
        ) },
      ] },
      { type: 'ul', items: [
        t('FDH is CTO in Portuguese UI.', 'FDH aparece como CTO na UI em português.', 'FDH s’affiche CTO dans l’UI portugaise.'),
        t('FOSC is CEO (splice closure).', 'FOSC é CEO (caixa de emenda).', 'FOSC est CEO (boîte d’épissure).'),
        t('ODF is DIO.', 'ODF é DIO.', 'ODF est DIO.'),
      ] },
      { type: 'related', slugs: ['import-kml', 'fdh-cto', 'map-api-keys'] },
    ],
  },
  {
    slug: 'import-kml',
    category: 'map',
    minutes: 5,
    title: t('Import or export KML / KMZ', 'Importar ou exportar KML / KMZ', 'Importer ou exporter KML / KMZ'),
    summary: t(
      'Bring an existing plant file onto the map, or take TurboISP plant out to Google Earth.',
      'Traga um arquivo de planta existente para o mapa, ou leve a planta do TurboISP para o Google Earth.',
      'Importe un fichier de plante existant sur la carte, ou exportez la plante TurboISP vers Google Earth.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Infrastructure', 'Map', 'KML / KMZ'],
        [...turbo, 'Infraestrutura', 'Mapa', 'KML / KMZ'],
        [...turbo, 'Infrastructure', 'Carte', 'KML / KMZ'],
      ) },
      { type: 'steps', items: [
        { title: t('Import from the map toolbar', 'Importe pela toolbar do mapa', 'Importez depuis la barre d’outils'), body: t(
          'Accepts .kml and .kmz. Review created vs failed counts in the toast before walking away.',
          'Aceita .kml e .kmz. Confira no toast o que foi criado vs o que falhou antes de sair.',
          'Accepte .kml et .kmz. Vérifiez dans le toast créés vs échecs avant de partir.',
        ) },
        { title: t('Export when you need a snapshot', 'Exporte quando precisar de um snapshot', 'Exportez pour un snapshot'), body: t(
          'Empty export means there is nothing in the current view/filters — not that KMZ is broken.',
          'Export vazio significa nada na visão/filtros atuais — não que o KMZ esteja quebrado.',
          'Export vide = rien dans la vue/filtres actuels — pas un KMZ cassé.',
        ) },
      ] },
      { type: 'related', slugs: ['network-map'] },
    ],
  },
  {
    slug: 'fdh-cto',
    category: 'map',
    minutes: 6,
    title: t('FDH / CTO and splitters', 'FDH / CTO e splitters', 'FDH / CTO et splitters'),
    summary: t(
      'Cabinets and splitters are inventory objects on the map, not just a drawing.',
      'Armários e splitters são objetos de inventário no mapa, não só um desenho.',
      'Armoires et splitters sont des objets d’inventaire sur la carte, pas un simple dessin.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Infrastructure', 'FDH'],
        [...turbo, 'Infraestrutura', 'CTO'],
        [...turbo, 'Infrastructure', 'FDH'],
      ) },
      { type: 'p', text: t(
        'Place the cabinet, then hang splitters and drop cables from it. Ports are how you later provision an ONU to a real address.',
        'Posicione o armário, depois pendure splitters e drops. Portas são como depois você provisiona a ONU num endereço real.',
        'Placez l’armoire, puis accrochez splitters et drops. Les ports servent ensuite à provisionner l’ONU à une vraie adresse.',
      ) },
      { type: 'related', slugs: ['network-map', 'provision-onu'] },
    ],
  },
  {
    slug: 'internet-plans',
    category: 'plans',
    minutes: 6,
    title: t('Create an internet plan', 'Criar um plano de internet', 'Créer un forfait internet'),
    summary: t(
      'Speed, price, and the product the contract will sell.',
      'Velocidade, preço e o produto que o contrato vai vender.',
      'Débit, prix, et le produit que le contrat vendra.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'Plans', 'Internet'],
        [...turbo, 'Configurações', 'Planos', 'Internet'],
        [...turbo, 'Paramètres', 'Forfaits', 'Internet'],
      ) },
      { type: 'steps', items: [
        { title: t('Set the commercial fields', 'Preencha o comercial', 'Remplissez le commercial'), body: t(
          'Name, download/upload, and price in the POP currency. This is what invoices and the portal show.',
          'Nome, download/upload e preço na moeda do POP. É o que faturas e o portal mostram.',
          'Nom, download/upload et prix dans la devise du POP. C’est ce que factures et portail affichent.',
        ) },
        { title: t('Wire RADIUS later if needed', 'Ligue o RADIUS depois se precisar', 'Branchez RADIUS plus tard si besoin'), body: t(
          'A plan can exist before NAS is live. Do not block sales on a missing pool — block activation.',
          'O plano pode existir antes do NAS. Não trave venda por pool ausente — trave ativação.',
          'Un forfait peut exister avant le NAS. Ne bloquez pas la vente sur un pool manquant — bloquez l’activation.',
        ) },
      ] },
      { type: 'related', slugs: ['plan-contracts', 'add-contract'] },
    ],
  },
  {
    slug: 'plan-contracts',
    category: 'plans',
    minutes: 5,
    title: t('Plan contracts and combos', 'Contratos de plano e combos', 'Contrats de forfait et combos'),
    summary: t(
      'Templates for what a subscriber contract contains — internet, TV, mobile, landline, or a combo.',
      'Modelos do que o contrato do assinante contém — internet, TV, móvel, fixo ou combo.',
      'Modèles de contenu du contrat abonné — internet, TV, mobile, fixe ou combo.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'Plans', 'Contracts'],
        [...turbo, 'Configurações', 'Planos', 'Contratos'],
        [...turbo, 'Paramètres', 'Forfaits', 'Contrats'],
      ) },
      { type: 'p', text: t(
        'Combos live next to internet/TV/mobile/landline under the same Plans menu. Put loyalty terms on the plan you actually sell.',
        'Combos ficam ao lado de internet/TV/móvel/fixo no mesmo menu Planos. Fidelidade vai no plano que você realmente vende.',
        'Les combos sont à côté d’internet/TV/mobile/fixe dans le même menu Forfaits. La fidélité va sur le forfait réellement vendu.',
      ) },
      { type: 'related', slugs: ['internet-plans', 'add-contract'] },
    ],
  },
  {
    slug: 'create-subscriber',
    category: 'subscribers',
    minutes: 7,
    title: t('Create a subscriber', 'Cadastrar um assinante', 'Créer un abonné'),
    summary: t(
      'Residential or commercial, tax id, address, and an optional portal password.',
      'Residencial ou comercial, documento, endereço e senha opcional do portal.',
      'Résidentiel ou commercial, identifiant fiscal, adresse, et mot de passe portail optionnel.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Subscribers', 'List', 'Add client'],
        [...turbo, 'Assinantes', 'Lista', 'Adicionar cliente'],
        [...turbo, 'Abonnés', 'Liste', 'Ajouter un client'],
      ) },
      { type: 'steps', items: [
        { title: t('Open the list, not only the dashboard', 'Abra a lista, não só o painel', 'Ouvrez la liste, pas seulement le tableau'), body: t(
          'Subscribers has a dashboard tab and a list tab. Add client is on the list.',
          'Assinantes tem aba painel e aba lista. Adicionar cliente está na lista.',
          'Abonnés a un onglet tableau et un onglet liste. Ajouter un client est sur la liste.',
        ) },
        { title: t('Pick person or company', 'Pessoa ou empresa', 'Personne ou société'), body: t(
          'Residential vs commercial changes which tax fields lock. Brazil validates CPF/CNPJ; Canada formats postal codes.',
          'Residencial vs comercial muda quais campos fiscais travam. Brasil valida CPF/CNPJ; Canadá formata postal code.',
          'Résidentiel vs commercial change les champs fiscaux. Brésil valide CPF/CNPJ ; Canada formate le code postal.',
        ) },
        { title: t('Save, then add a contract', 'Salve, depois adicione contrato', 'Enregistrez, puis ajoutez un contrat'), body: t(
          'A subscriber without a contract cannot be billed or provisioned. Open the profile and add the service next.',
          'Assinante sem contrato não fatura nem provisiona. Abra o perfil e acrescente o serviço em seguida.',
          'Un abonné sans contrat ne se facture ni ne se provisionne. Ouvrez le profil et ajoutez le service ensuite.',
        ) },
      ] },
      { type: 'related', slugs: ['add-contract', 'customer-portal'] },
    ],
  },
  {
    slug: 'add-contract',
    category: 'subscribers',
    minutes: 7,
    title: t('Add a service contract', 'Adicionar um contrato de serviço', 'Ajouter un contrat de service'),
    summary: t(
      'The contract is what bills, authenticates, and ties the address to the plant.',
      'O contrato é o que fatura, autentica e liga o endereço à planta.',
      'Le contrat facture, authentifie et lie l’adresse à la plante.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Subscribers', 'Profile', 'Contracts'],
        [...turbo, 'Assinantes', 'Perfil', 'Contratos'],
        [...turbo, 'Abonnés', 'Profil', 'Contrats'],
      ) },
      { type: 'steps', items: [
        { title: t('Add at least one service', 'Adicione pelo menos um serviço', 'Ajoutez au moins un service'), body: t(
          'The modal refuses an empty service list. Pick the internet plan (and combo pieces if you sell them).',
          'O modal recusa lista de serviços vazia. Escolha o plano de internet (e pedaços de combo se vender).',
          'Le modal refuse une liste de services vide. Choisissez le forfait internet (et les pièces combo si vous en vendez).',
        ) },
        { title: t('Fill the technical side', 'Preencha o lado técnico', 'Remplissez le côté technique'), body: t(
          'Login, pool or pinned IP, and the POP. This is what RADIUS and provisioning will use.',
          'Login, pool ou IP pinado, e o POP. É o que RADIUS e provisionamento vão usar.',
          'Login, pool ou IP épinglé, et le POP. C’est ce que RADIUS et le provisionnement utiliseront.',
        ) },
      ] },
      { type: 'related', slugs: ['create-subscriber', 'generate-invoices', 'provision-onu'] },
    ],
  },
  {
    slug: 'client-sessions',
    category: 'subscribers',
    minutes: 4,
    title: t('See who is online', 'Ver quem está online', 'Voir qui est en ligne'),
    summary: t(
      'Live RADIUS sessions — not a ping sweep.',
      'Sessões RADIUS ao vivo — não um ping sweep.',
      'Sessions RADIUS live — pas un ping sweep.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Subscribers', 'Client sessions'],
        [...turbo, 'Assinantes', 'Sessões de clientes'],
        [...turbo, 'Abonnés', 'Sessions clients'],
      ) },
      { type: 'p', text: t(
        'If this list is empty, fix NAS accounting before you rebuild the subscriber. Disconnect is a CoA to the NAS, not a row delete.',
        'Se a lista estiver vazia, arrume o accounting do NAS antes de refazer o assinante. Desconectar é CoA no NAS, não apagar a linha.',
        'Si la liste est vide, corrigez l’accounting NAS avant de recréer l’abonné. Déconnecter = CoA vers le NAS, pas une suppression de ligne.',
      ) },
      { type: 'related', slugs: ['radius-nas', 'disconnect-session'] },
    ],
  },
]
