import type { Article } from './types'
import { t, trail } from './helpers'

const turbo = ['TurboMenu'] as const

export const mapPlansCustomers: Article[] = [
  {
    slug: 'map-api-keys',
    category: 'map',
    minutes: 4,
    title: t('Put map keys on the tenant', 'Colocar chaves de mapa no tenant', 'Mettre les clés carte sur le tenant', 'Poner las claves del mapa en el operador'),
    summary: t(
      'Google Maps, Mapbox, and HERE keys live in this tenant’s global settings — never in a shared env file.',
      'Chaves Google Maps, Mapbox e HERE ficam nas configurações globais deste tenant — nunca num .env compartilhado.',
      'Les clés Google Maps, Mapbox et HERE se trouvent dans les paramètres globaux de ce tenant — jamais dans un .env partagé.',
      'Las claves de Google Maps, Mapbox y HERE se guardan en la configuración global de este operador — nunca en un .env compartido.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'General', 'Global settings'],
        [...turbo, 'Configurações', 'Geral', 'Configurações globais'],
        [...turbo, 'Paramètres', 'Général', 'Paramètres globaux'],
        [...turbo, 'Configuración', 'General', 'Configuración global'],
      ) },
      { type: 'steps', items: [
        { title: t('Paste only this tenant’s key', 'Cole só a chave deste tenant', 'Collez uniquement la clé de ce tenant', 'Pega solo la clave de este operador'), body: t(
          'Admins see the fields. Non-admins get them stripped on GET. Switching tenant must not reuse the previous operator’s tiles.',
          'Admins veem os campos. Quem não é admin recebe os valores omitidos no GET. Trocar de tenant não pode reutilizar os mosaicos do operador anterior.',
          'Les admins voient les champs. Ceux qui ne sont pas admin les reçoivent masqués au GET. Changer de tenant ne doit pas réutiliser les tuiles de l’opérateur précédent.',
          'Los administradores ven los campos. Quien no es administrador los recibe omitidos en el GET. Al cambiar de operador no se deben reutilizar los mosaicos del operador anterior.',
        ) },
        { title: t('Open the map to confirm tiles', 'Abra o mapa para confirmar os mosaicos', 'Ouvrez la carte pour confirmer les tuiles', 'Abre el mapa para confirmar los mosaicos'), body: t(
          'Infrastructure → Map. If the basemap is blank, the key is missing, restricted to the wrong HTTP referrer, or belongs to another cloud project.',
          'Infraestrutura → Mapa. Mapa-base em branco: chave ausente, referenciador HTTP errado ou projeto de nuvem errado.',
          'Infrastructure → Carte. Fond de carte blanc: clé absente, référent HTTP incorrect ou mauvais projet infonuagique.',
          'Infraestructura → Mapa. Mapa base en blanco: falta la clave, está restringida al referente HTTP incorrecto o pertenece a otro proyecto en la nube.',
        ) },
      ] },
      { type: 'callout', kind: 'warn', text: t(
        'Do not store map keys in localStorage as the source of truth. The API is scoped by tenant_id.',
        'Não use localStorage como fonte da verdade para chaves de mapa. A API é por tenant_id.',
        'Ne stockez pas les clés carte dans localStorage comme source de vérité. L’API est cloisonnée par tenant_id.',
        'No guardes las claves del mapa en localStorage como fuente de verdad. La API queda aislada por tenant_id.',
      ) },
      { type: 'related', slugs: ['network-map', 'import-kml'] },
    ],
  },
  {
    slug: 'network-map',
    category: 'map',
    minutes: 8,
    title: t('Work the network map', 'Usar o mapa de rede', 'Utiliser la carte réseau', 'Usar el mapa de red'),
    summary: t(
      'Poles, cables, splitters, FDH/CTO, and subscribers on one GIS canvas.',
      'Postes, cabos, splitters, FDH/CTO e assinantes numa mesma tela GIS.',
      'Poteaux, câbles, splitters, FDH/CTO et abonnés sur un même canevas SIG.',
      'Postes, cables, splitters, FDH/CTO y abonados en un mismo mapa SIG.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Infrastructure', 'Map'],
        [...turbo, 'Infraestrutura', 'Mapa'],
        [...turbo, 'Infrastructure', 'Carte'],
        [...turbo, 'Infraestructura', 'Mapa'],
      ) },
      { type: 'steps', items: [
        { title: t('Pick a layer, then draw', 'Escolha a camada e desenhe', 'Choisissez une couche, puis dessinez', 'Elige una capa y luego dibuja'), body: t(
          'The toolbar is the inventory type you are placing. Click a feature to open detail, uploads, and comments.',
          'A barra de ferramentas é o tipo de item que você está lançando. Clique em um elemento para ver detalhes, anexos e comentários.',
          'La barre d’outils est le type d’élément que vous placez. Cliquez sur un élément pour voir le détail, les pièces jointes et les commentaires.',
          'La barra de herramientas es el tipo de inventario que estás colocando. Haz clic en un elemento para abrir el detalle, los adjuntos y los comentarios.',
        ) },
        { title: t('Keep plant in projects', 'Mantenha a planta em projetos', 'Gardez le réseau dans des projets', 'Mantén la planta en proyectos'), body: t(
          'OSP hangs off tenant → project → phase. Do not dump every pole into a scratch layer you cannot report on.',
          'OSP pende de tenant → projeto → fase. Não jogue todo poste numa camada solta que não vira relatório.',
          'L’OSP se rattache tenant → projet → phase. Ne jetez pas chaque poteau dans une couche jetable inutilisable en rapport.',
          'La OSP cuelga de operador → proyecto → fase. No metas todos los postes en una capa suelta de la que no puedas sacar reportes.',
        ) },
      ] },
      { type: 'ul', items: [
        t('FDH is CTO in Portuguese UI.', 'FDH aparece como CTO na interface em português.', 'FDH s’affiche comme CTO dans l’interface en portugais.', 'FDH aparece como CTO en la interfaz en portugués.'),
        t('FOSC is CEO (splice closure).', 'FOSC é CEO (caixa de emenda).', 'FOSC est CEO (boîte d’épissure).', 'FOSC es CEO (cierre de empalme).'),
        t('ODF is DIO.', 'ODF é DIO.', 'ODF est DIO.', 'ODF es DIO.'),
      ] },
      { type: 'related', slugs: ['import-kml', 'fdh-cto', 'map-api-keys'] },
    ],
  },
  {
    slug: 'import-kml',
    category: 'map',
    minutes: 5,
    title: t('Import or export KML / KMZ', 'Importar ou exportar KML / KMZ', 'Importer ou exporter KML / KMZ', 'Importar o exportar KML / KMZ'),
    summary: t(
      'Bring an existing plant file onto the map, or take TurboISP plant out to Google Earth.',
      'Traga um arquivo de planta existente para o mapa, ou leve a planta do TurboISP para o Google Earth.',
      'Importez un fichier de réseau existant sur la carte, ou exportez le réseau TurboISP vers Google Earth.',
      'Trae al mapa un archivo de planta existente, o lleva la planta de TurboISP a Google Earth.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Infrastructure', 'Map', 'KML / KMZ'],
        [...turbo, 'Infraestrutura', 'Mapa', 'KML / KMZ'],
        [...turbo, 'Infrastructure', 'Carte', 'KML / KMZ'],
        [...turbo, 'Infraestructura', 'Mapa', 'KML / KMZ'],
      ) },
      { type: 'steps', items: [
        { title: t('Import from the map toolbar', 'Importe pela barra de ferramentas do mapa', 'Importez depuis la barre d’outils', 'Importa desde la barra de herramientas del mapa'), body: t(
          'Accepts .kml and .kmz. Review created vs failed counts in the toast before walking away.',
          'Aceita .kml e .kmz. Confira no aviso o que foi criado e o que falhou antes de sair.',
          'Accepte .kml et .kmz. Vérifiez dans l’avis ce qui a été créé et ce qui a échoué avant de partir.',
          'Acepta .kml y .kmz. Revisa en el aviso lo que se creó y lo que falló antes de irte.',
        ) },
        { title: t('Export when you need a snapshot', 'Exporte quando precisar de um instantâneo', 'Exportez quand vous avez besoin d’un instantané', 'Exporta cuando necesites una instantánea'), body: t(
          'Empty export means there is nothing in the current view/filters — not that KMZ is broken.',
          'Exportação vazia significa que não há nada na visão ou nos filtros atuais — não que o KMZ esteja quebrado.',
          'Une exportation vide signifie qu’il n’y a rien dans la vue ou les filtres actuels — pas un KMZ brisé.',
          'Una exportación vacía significa que no hay nada en la vista o en los filtros actuales — no que el KMZ esté dañado.',
        ) },
      ] },
      { type: 'related', slugs: ['network-map'] },
    ],
  },
  {
    slug: 'fdh-cto',
    category: 'map',
    minutes: 6,
    title: t('FDH / CTO and splitters', 'FDH / CTO e splitters', 'FDH / CTO et splitters', 'FDH / CTO y splitters'),
    summary: t(
      'Cabinets and splitters are inventory objects on the map, not just a drawing.',
      'Armários e splitters são objetos de inventário no mapa, não só um desenho.',
      'Armoires et splitters sont des objets d’inventaire sur la carte, pas un simple dessin.',
      'Los armarios y los splitters son objetos de inventario en el mapa, no solo un dibujo.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Infrastructure', 'FDH'],
        [...turbo, 'Infraestrutura', 'CTO'],
        [...turbo, 'Infrastructure', 'FDH'],
        [...turbo, 'Infraestructura', 'FDH'],
      ) },
      { type: 'p', text: t(
        'Place the cabinet, then hang splitters and drop cables from it. Ports are how you later provision an ONU to a real address.',
        'Posicione o armário, depois pendure splitters e cabos drop. Portas são como depois você provisiona a ONU num endereço real.',
        'Placez l’armoire, puis accrochez-y les splitters et les câbles de branchement. Les ports servent ensuite à provisionner l’ONU à une vraie adresse.',
        'Coloca el armario y cuelga de él los splitters y los cables de acometida. Los puertos sirven para aprovisionar después la ONU en una dirección real.',
      ) },
      { type: 'related', slugs: ['network-map', 'provision-onu'] },
    ],
  },
  {
    slug: 'internet-plans',
    category: 'plans',
    minutes: 6,
    title: t('Create an internet plan', 'Criar um plano de internet', 'Créer un forfait internet', 'Crear un plan de internet'),
    summary: t(
      'Speed, price, and the product the contract will sell.',
      'Velocidade, preço e o produto que o contrato vai vender.',
      'Débit, prix, et le produit que le contrat vendra.',
      'Velocidad, precio y el producto que el contrato va a vender.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'Plans', 'Internet'],
        [...turbo, 'Configurações', 'Planos', 'Internet'],
        [...turbo, 'Paramètres', 'Forfaits', 'Internet'],
        [...turbo, 'Configuración', 'Planes', 'Internet'],
      ) },
      { type: 'steps', items: [
        { title: t('Set the commercial fields', 'Preencha o comercial', 'Remplissez le commercial', 'Completa los datos comerciales'), body: t(
          'Name, download/upload, and price in the POP currency. This is what invoices and the portal show.',
          'Nome, download/upload e preço na moeda do POP. É o que faturas e o portal mostram.',
          'Nom, téléchargement et téléversement, et prix dans la devise du POP. C’est ce que les factures et le portail affichent.',
          'Nombre, descarga y subida, y precio en la moneda del POP. Es lo que muestran las facturas y el portal.',
        ) },
        { title: t('Wire RADIUS later if needed', 'Ligue o RADIUS depois se precisar', 'Branchez RADIUS plus tard si besoin', 'Conecta RADIUS después si hace falta'), body: t(
          'A plan can exist before NAS is live. Do not block sales on a missing pool — block activation.',
          'O plano pode existir antes do NAS. Não trave venda por pool ausente — trave ativação.',
          'Un forfait peut exister avant que le NAS soit en service. Ne bloquez pas la vente pour un pool manquant — bloquez l’activation.',
          'Un plan puede existir antes de que el NAS esté en línea. No bloquees la venta por un pool que falta: bloquea la activación.',
        ) },
      ] },
      { type: 'related', slugs: ['plan-contracts', 'add-contract'] },
    ],
  },
  {
    slug: 'plan-contracts',
    category: 'plans',
    minutes: 5,
    title: t('Plan contracts and combos', 'Contratos de plano e combos', 'Contrats de forfait et combos', 'Contratos de plan y combos'),
    summary: t(
      'Templates for what a subscriber contract contains — internet, TV, mobile, landline, or a combo.',
      'Modelos do que o contrato do assinante contém — internet, TV, móvel, fixo ou combo.',
      'Modèles de contenu du contrat abonné — internet, TV, mobile, fixe ou combo.',
      'Plantillas de lo que incluye el contrato del abonado: internet, TV, móvil, línea fija o un combo.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Settings', 'Plans', 'Contracts'],
        [...turbo, 'Configurações', 'Planos', 'Contratos'],
        [...turbo, 'Paramètres', 'Forfaits', 'Contrats'],
        [...turbo, 'Configuración', 'Planes', 'Contratos'],
      ) },
      { type: 'p', text: t(
        'Combos live next to internet/TV/mobile/landline under the same Plans menu. Put loyalty terms on the plan you actually sell.',
        'Combos ficam ao lado de internet/TV/móvel/fixo no mesmo menu Planos. Fidelidade vai no plano que você realmente vende.',
        'Les combos sont à côté d’internet/TV/mobile/fixe dans le même menu Forfaits. La fidélité va sur le forfait réellement vendu.',
        'Los combos están junto a internet, TV, móvil y línea fija, en el mismo menú Planes. Pon la permanencia en el plan que realmente vendes.',
      ) },
      { type: 'related', slugs: ['internet-plans', 'add-contract', 'contract-loyalty'] },
    ],
  },
  {
    slug: 'create-subscriber',
    category: 'subscribers',
    minutes: 7,
    title: t('Create a subscriber', 'Cadastrar um assinante', 'Créer un abonné', 'Dar de alta un abonado'),
    summary: t(
      'Residential or commercial, tax id, address, and an optional portal password.',
      'Residencial ou comercial, documento, endereço e senha opcional do portal.',
      'Résidentiel ou commercial, identifiant fiscal, adresse, et mot de passe portail optionnel.',
      'Residencial o comercial, documento fiscal, dirección y una contraseña opcional del portal.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Subscribers', 'List', 'Add client'],
        [...turbo, 'Assinantes', 'Lista', 'Adicionar cliente'],
        [...turbo, 'Abonnés', 'Liste', 'Ajouter un client'],
        [...turbo, 'Abonados', 'Lista', 'Agregar cliente'],
      ) },
      { type: 'steps', items: [
        { title: t('Open the list, not only the dashboard', 'Abra a lista, não só o painel', 'Ouvrez la liste, pas seulement le tableau de bord', 'Abre la lista, no solo el panel'), body: t(
          'Subscribers has a dashboard tab and a list tab. Add client is on the list.',
          'Assinantes tem aba painel e aba lista. Adicionar cliente está na lista.',
          'Abonnés a un onglet tableau de bord et un onglet liste. Ajouter un client est sur la liste.',
          'Abonados tiene una pestaña de panel y una de lista. Agregar cliente está en la lista.',
        ) },
        { title: t('Pick person or company', 'Pessoa ou empresa', 'Personne ou société', 'Elige persona o empresa'), body: t(
          'Residential vs commercial changes which tax fields lock. Brazil validates CPF/CNPJ; Canada formats postal codes.',
          'Residencial vs comercial muda quais campos fiscais travam. Brasil valida CPF/CNPJ; Canadá formata o código postal.',
          'Résidentiel vs commercial change les champs fiscaux. Le Brésil valide CPF/CNPJ; le Canada formate le code postal.',
          'Residencial o comercial cambia qué campos fiscales se bloquean. Brasil valida CPF/CNPJ; Canadá formatea el código postal.',
        ) },
        { title: t('Save, then add a contract', 'Salve, depois adicione contrato', 'Enregistrez, puis ajoutez un contrat', 'Guarda y luego agrega el contrato'), body: t(
          'A subscriber without a contract cannot be billed or provisioned. Open the profile and add the service next.',
          'Assinante sem contrato não fatura nem provisiona. Abra o perfil e acrescente o serviço em seguida.',
          'Un abonné sans contrat ne se facture ni ne se provisionne. Ouvrez le profil et ajoutez le service ensuite.',
          'Un abonado sin contrato no se puede facturar ni aprovisionar. Abre el perfil y agrega el servicio enseguida.',
        ) },
      ] },
      { type: 'related', slugs: ['add-contract', 'customer-portal'] },
    ],
  },
  {
    slug: 'add-contract',
    category: 'subscribers',
    minutes: 7,
    title: t('Add a service contract', 'Adicionar um contrato de serviço', 'Ajouter un contrat de service', 'Agregar un contrato de servicio'),
    summary: t(
      'The contract is what bills, authenticates, and ties the address to the plant.',
      'O contrato é o que fatura, autentica e liga o endereço à planta.',
      'Le contrat facture, authentifie et relie l’adresse au réseau.',
      'El contrato es lo que factura, autentica y une la dirección con la planta.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Subscribers', 'Profile', 'Contracts'],
        [...turbo, 'Assinantes', 'Perfil', 'Contratos'],
        [...turbo, 'Abonnés', 'Profil', 'Contrats'],
        [...turbo, 'Abonados', 'Perfil', 'Contratos'],
      ) },
      { type: 'steps', items: [
        { title: t('Add at least one service', 'Adicione pelo menos um serviço', 'Ajoutez au moins un service', 'Agrega al menos un servicio'), body: t(
          'The modal refuses an empty service list. Pick the internet plan (and combo pieces if you sell them).',
          'O modal recusa lista de serviços vazia. Escolha o plano de internet (e pedaços de combo se vender).',
          'Le modal refuse une liste de services vide. Choisissez le forfait internet (et les pièces combo si vous en vendez).',
          'El modal rechaza una lista de servicios vacía. Elige el plan de internet (y las partes del combo, si las vendes).',
        ) },
        { title: t('Fill the technical side', 'Preencha o lado técnico', 'Remplissez le côté technique', 'Completa la parte técnica'), body: t(
          'Login, pool or pinned IP, and the POP. This is what RADIUS and provisioning will use.',
          'Login, pool ou IP fixo, e o POP. É o que RADIUS e o provisionamento vão usar.',
          'Login, pool ou IP fixe, et le POP. C’est ce que RADIUS et le provisionnement utiliseront.',
          'Login, pool o IP fija, y el POP. Es lo que van a usar RADIUS y el aprovisionamiento.',
        ) },
        { title: t('Set loyalty months', 'Defina os meses de fidelidade', 'Définissez les mois de fidélité', 'Define los meses de permanencia'), body: t(
          'Loyalty is 0–24 months. 0 is month-to-month. The end date is calculated when you set the contract to Active.',
          'Fidelidade é 0–24 meses. 0 é mensal. A data final é calculada quando o contrato fica Ativo.',
          'La fidélité est 0–24 mois. 0 = mois par mois. La date de fin est calculée quand le contrat passe Actif.',
          'La permanencia va de 0 a 24 meses. 0 es mes a mes. La fecha de fin se calcula cuando el contrato pasa a Activo.',
        ) },
      ] },
      { type: 'related', slugs: ['create-subscriber', 'generate-invoices', 'provision-onu', 'contract-loyalty'] },
    ],
  },
  {
    slug: 'contract-loyalty',
    category: 'subscribers',
    minutes: 4,
    title: t('Contract loyalty term', 'Fidelidade do contrato', 'Fidélité du contrat', 'Permanencia del contrato'),
    summary: t(
      '0–24 months on the contract. Zero is month-to-month. The end date starts when the contract goes Active.',
      '0–24 meses no contrato. Zero é mensal. A data final começa quando o contrato fica Ativo.',
      '0–24 mois sur le contrat. Zéro = mois par mois. La date de fin démarre quand le contrat passe Actif.',
      'De 0 a 24 meses en el contrato. Cero es mes a mes. La fecha de fin empieza cuando el contrato pasa a Activo.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Subscribers', 'Profile', 'Contracts', 'New contract', 'Loyalty'],
        [...turbo, 'Assinantes', 'Perfil', 'Contratos', 'Novo contrato', 'Fidelidade'],
        [...turbo, 'Abonnés', 'Profil', 'Contrats', 'Nouveau contrat', 'Fidélité'],
        [...turbo, 'Abonados', 'Perfil', 'Contratos', 'Nuevo contrato', 'Permanencia'],
      ) },
      { type: 'p', text: t(
        'Loyalty is a term on the service contract, not a date you type. Pick 0 through 24 months on New Contract.',
        'Fidelidade é um prazo no contrato de serviço, não uma data digitada. Escolha de 0 a 24 meses no Novo contrato.',
        'La fidélité est une durée sur le contrat de service, pas une date saisie. Choisissez 0 à 24 mois dans Nouveau contrat.',
        'La permanencia es un plazo del contrato de servicio, no una fecha que escribes. Elige de 0 a 24 meses en Nuevo contrato.',
      ) },
      { type: 'ul', items: [
        t(
          '0 months = month to month. No loyalty end date is stored.',
          '0 meses = mensal. Nenhuma data final de fidelidade é gravada.',
          '0 mois = mois par mois. Aucune date de fin de fidélité n’est enregistrée.',
          '0 meses = mes a mes. No se guarda fecha de fin de permanencia.',
        ),
        t(
          '1–24 months = locked term. The clock does not start while the contract is still pending signature.',
          '1–24 meses = prazo fechado. O relógio não começa enquanto o contrato ainda aguarda assinatura.',
          '1–24 mois = durée fermée. L’horloge ne démarre pas tant que le contrat attend une signature.',
          '1–24 meses = plazo cerrado. El reloj no empieza mientras el contrato sigue pendiente de firma.',
        ),
        t(
          'When status becomes Active, TurboISP sets loyalty end date = activation date plus the months you picked.',
          'Quando o status vira Ativo, o TurboISP grava o fim da fidelidade = data de ativação mais os meses escolhidos.',
          'Quand le statut devient Actif, TurboISP fixe la fin de fidélité = date d’activation plus les mois choisis.',
          'Cuando el estado pasa a Activo, TurboISP fija el fin de permanencia = fecha de activación más los meses que elegiste.',
        ),
      ] },
      { type: 'callout', kind: 'tip', text: t(
        'The contracts table shows Month to month, Starts on activation, or the end date after the contract is live.',
        'A tabela de contratos mostra Mensal, Inicia na ativação, ou a data final depois que o contrato está ativo.',
        'Le tableau des contrats affiche Mois par mois, Démarre à l’activation, ou la date de fin une fois le contrat actif.',
        'La tabla de contratos muestra Mes a mes, Inicia en la activación, o la fecha de fin cuando el contrato ya está activo.',
      ) },
      { type: 'related', slugs: ['add-contract', 'plan-contracts'] },
    ],
  },
  {
    slug: 'client-sessions',
    category: 'subscribers',
    minutes: 4,
    title: t('See who is online', 'Ver quem está online', 'Voir qui est en ligne', 'Ver quién está en línea'),
    summary: t(
      'Live RADIUS sessions — not a ping sweep.',
      'Sessões RADIUS ao vivo — não uma varredura de ping.',
      'Sessions RADIUS en direct — pas un balayage de ping.',
      'Sesiones RADIUS en vivo — no un barrido de ping.',
    ),
    body: [
      { type: 'path', trail: trail(
        [...turbo, 'Subscribers', 'Client sessions'],
        [...turbo, 'Assinantes', 'Sessões de clientes'],
        [...turbo, 'Abonnés', 'Sessions clients'],
        [...turbo, 'Abonados', 'Sesiones de clientes'],
      ) },
      { type: 'p', text: t(
        'If this list is empty, fix NAS accounting before you rebuild the subscriber. Disconnect is a CoA to the NAS, not a row delete.',
        'Se a lista estiver vazia, arrume o accounting do NAS antes de refazer o assinante. Desconectar é CoA no NAS, não apagar a linha.',
        'Si la liste est vide, corrigez l’accounting NAS avant de recréer l’abonné. Déconnecter = CoA vers le NAS, pas une suppression de ligne.',
        'Si la lista está vacía, corrige el accounting del NAS antes de recrear al abonado. Desconectar es un CoA al NAS, no borrar la fila.',
      ) },
      { type: 'related', slugs: ['radius-nas', 'disconnect-session'] },
    ],
  },
]
