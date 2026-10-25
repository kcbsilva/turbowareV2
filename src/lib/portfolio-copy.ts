import type { LucideIcon } from 'lucide-react'
import { Bot, Database, Headphones, Map, Network } from 'lucide-react'
import { c, type Copy } from './locale-copy'

export type PickerProject = {
  name: string
  categoryLabel: Copy
  accent: string
  icon: LucideIcon
  href: string
  description: Copy
}

export const PICKER_PROJECTS: PickerProject[] = [
  {
    name: 'TurboISP',
    categoryLabel: c(
      'Network operations',
      'Operação de rede',
      'Exploitation du réseau',
      'Operación de red',
    ),
    accent: '#1AABF0',
    icon: Network,
    href: '/turboisp/site',
    description: c(
      'The operating system for an ISP: CRM, billing, network records, automation, and customer conversations in one place. TurboISP runs several POPs, shows what is happening now, and scales from a small provider to a carrier-sized network.',
      'O sistema de operação do provedor: CRM, faturamento, cadastro de rede, automação e atendimento no mesmo lugar. O TurboISP conduz vários POPs, mostra o que acontece agora e acompanha do provedor pequeno ao porte de operadora.',
      'Le système d’exploitation du FAI: CRM, facturation, dossier réseau, automatisation et conversations clients au même endroit. TurboISP mène plusieurs POP, montre ce qui se passe maintenant et suit le fournisseur, du petit réseau au déploiement d’envergure.',
      'El sistema de operación del ISP: CRM, facturación, registro de red, automatización y atención al cliente en un solo lugar. TurboISP lleva varios POP, muestra lo que pasa ahora y acompaña desde un proveedor chico hasta una red de operador.',
    ),
  },
  {
    name: 'TurboChat',
    categoryLabel: c(
      'Customer conversations',
      'Conversas com o cliente',
      'Conversations clients',
      'Conversaciones con el cliente',
    ),
    accent: '#ff8a3d',
    icon: Headphones,
    href: '/turbochat/site',
    description: c(
      'Support and follow-up on Meta, Telegram, and 0800 voice, with automation and the team queue on one screen.',
      'Atendimento e acompanhamento no Meta, no Telegram e na voz 0800, com automação e a fila da equipe na mesma tela.',
      'Soutien et suivi sur Meta, Telegram et la ligne 0800, avec automatisation et la file de l’équipe sur un seul écran.',
      'Atención y seguimiento en Meta, Telegram y voz 0800, con automatización y la cola del equipo en una sola pantalla.',
    ),
  },
  {
    name: 'TurboAgent',
    categoryLabel: c(
      'Agent automation',
      'Automação com agente',
      'Automatisation par agent',
      'Automatización con agente',
    ),
    accent: '#7dd56f',
    icon: Bot,
    href: '/turboagent/site',
    description: c(
      'An operations agent that runs tasks, chains workflows, and helps the team across systems without leaving one workspace.',
      'Um agente de operação que executa tarefas, encadeia fluxos e ajuda a equipe entre os sistemas, sem sair de um só ambiente.',
      'Un agent d’exploitation qui exécute les tâches, enchaîne les flux et aide l’équipe entre les systèmes, sans quitter un seul espace.',
      'Un agente de operación que ejecuta tareas, encadena flujos y ayuda al equipo entre sistemas, sin salir de un solo espacio.',
    ),
  },
  {
    name: 'TurboGIS',
    categoryLabel: c(
      'Geospatial intelligence',
      'Inteligência geoespacial',
      'Intelligence géospatiale',
      'Inteligencia geoespacial',
    ),
    accent: '#f6c445',
    icon: Map,
    href: '/turbogis/site',
    description: c(
      'Map, document, and run networks, towers, and infrastructure with a live spatial view and a trail for every asset.',
      'Mapeie, documente e opere redes, torres e infraestrutura com visão espacial ao vivo e rastro de cada ativo.',
      'Cartographiez, documentez et exploitez réseaux, tours et infrastructure avec une vue spatiale en direct et une trace pour chaque actif.',
      'Mapea, documenta y opera redes, torres e infraestructura con una vista espacial en vivo y un rastro de cada activo.',
    ),
  },
  {
    name: 'TurboInfraBase',
    categoryLabel: c(
      'Infrastructure database',
      'Base de infraestrutura',
      'Base d’infrastructure',
      'Base de infraestructura',
    ),
    accent: '#ff6b6b',
    icon: Database,
    href: '/turboinfrabase/site',
    description: c(
      'One registry for power, water, gas, telecom, and the assets TurboGIS maps and the teams operate.',
      'Um cadastro só para energia, água, gás, telecom e os ativos que o TurboGIS mapeia e as equipes operam.',
      'Un seul registre pour l’électricité, l’eau, le gaz, les télécoms et les actifs que TurboGIS cartographie et que les équipes exploitent.',
      'Un solo registro para electricidad, agua, gas, telecom y los activos que TurboGIS mapea y los equipos operan.',
    ),
  },
]

export const pickerChrome = {
  previous: c(
    'Show previous product',
    'Mostrar o produto anterior',
    'Afficher le produit précédent',
    'Mostrar el producto anterior',
  ),
  next: c(
    'Show next product',
    'Mostrar o próximo produto',
    'Afficher le produit suivant',
    'Mostrar el producto siguiente',
  ),
  goTo: c('Go to {name}', 'Acessar o {name}', 'Accéder à {name}', 'Entrar a {name}'),
  language: c('Language', 'Idioma', 'Langue', 'Idioma'),
  pageTitle: c('Products', 'Produtos', 'Produits', 'Productos'),
}

export const productChrome = {
  comingSoon: c('Coming soon', 'Em breve', 'Bientôt disponible', 'Próximamente'),
  explore: c(
    'Explore the platform',
    'Conhecer a plataforma',
    'Explorer la plateforme',
    'Explorar la plataforma',
  ),
  platform: c('Platform', 'Plataforma', 'Plateforme', 'Plataforma'),
  why: c('Why it matters', 'Por que importa', 'Pourquoi ça compte', 'Por qué importa'),
  impact: c('Impact', 'Impacto', 'Impact', 'Impacto'),
  allProducts: c('All products', 'Todos os produtos', 'Tous les produits', 'Todos los productos'),
  access: c(
    'Platform access',
    'Acesso à plataforma',
    'Accès à la plateforme',
    'Acceso a la plataforma',
  ),
  back: c(
    'Back to products',
    'Voltar aos produtos',
    'Retour aux produits',
    'Volver a los productos',
  ),
  blocks: c(
    'Core building blocks for {name}',
    'O que sustenta o {name}',
    'Les bases de {name}',
    'Las piezas centrales de {name}',
  ),
  beyond: c(
    'Value created beyond the feature checklist',
    'Valor que vai além da lista de funções',
    'La valeur au-delà de la liste de fonctions',
    'Valor que va más allá de la lista de funciones',
  ),
  portfolio: c(
    'Explore the Turboware portfolio',
    'Ver o portfólio da Turboware',
    'Explorer le portefeuille Turboware',
    'Explorar el portafolio de Turboware',
  ),
  language: c('Language', 'Idioma', 'Langue', 'Idioma'),
}
