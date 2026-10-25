import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BarChart3,
  BellRing,
  Bot,
  BrainCircuit,
  Building2,
  Cable,
  Cloud,
  Database,
  Earth,
  GitBranch,
  Globe,
  Landmark,
  Layers3,
  Lock,
  Map,
  Megaphone,
  MessageSquare,
  MessagesSquare,
  Network,
  PhoneCall,
  Route,
  ScanSearch,
  Server,
  ShieldCheck,
  Workflow,
  Wrench,
} from 'lucide-react'
import { c, type Copy } from './locale-copy'

export type ProductSiteCard = {
  icon: LucideIcon
  title: Copy
  description: Copy
}

export type ProductSiteMetric = {
  value: string | Copy
  label: Copy
}

export type ProductSiteContent = {
  slug: string
  name: string
  categoryLabel: Copy
  accent: string
  comingSoon: boolean
  badge: Copy
  heroTitle: Copy
  heroSubtitle: Copy
  trustBadges: Copy[]
  stats: ProductSiteMetric[]
  modules: ProductSiteCard[]
  values: ProductSiteCard[]
  metricsLabel: Copy
  metricsTitle: Copy
  metrics: ProductSiteMetric[]
  ctaTitle: Copy
  ctaDescription: Copy
  footerNote: Copy
}

const soon = c('Coming soon', 'Em breve', 'Bientôt disponible', 'Próximamente')

export const PRODUCT_SITES: Record<string, ProductSiteContent> = {
  turbochat: {
    slug: 'turbochat',
    name: 'TurboChat',
    categoryLabel: c(
      'Customer conversations',
      'Conversas com o cliente',
      'Conversations clients',
      'Conversaciones con el cliente',
    ),
    accent: '#ff8a3d',
    comingSoon: true,
    badge: soon,
    heroTitle: c(
      'Support, sales, and retention in one conversation layer.',
      'Suporte, vendas e retenção na mesma camada de conversa.',
      'Soutien, ventes et rétention dans la même couche de conversation.',
      'Soporte, ventas y retención en la misma capa de conversación.',
    ),
    heroSubtitle: c(
      'TurboChat brings WhatsApp, Instagram, Telegram, voice, and the operator’s queue together so the team answers faster, automates the repeat work, and keeps the customer’s story in one place.',
      'O TurboChat junta WhatsApp, Instagram, Telegram, voz e a fila do operador para a equipe responder mais rápido, automatizar o que se repete e manter a história do cliente num só lugar.',
      'TurboChat réunit WhatsApp, Instagram, Telegram, la voix et la file de l’opérateur pour que l’équipe réponde plus vite, automatise le travail répétitif et garde l’historique du client au même endroit.',
      'TurboChat junta WhatsApp, Instagram, Telegram, voz y la cola del operador para que el equipo responda más rápido, automatice lo repetido y conserve la historia del cliente en un solo lugar.',
    ),
    trustBadges: [
      c('WhatsApp and Meta operations', 'Operação no WhatsApp e no Meta', 'Exploitation WhatsApp et Meta', 'Operación en WhatsApp y Meta'),
      c('Telegram ready', 'Pronto para o Telegram', 'Prêt pour Telegram', 'Listo para Telegram'),
      c('Voice support workflows', 'Fluxos de atendimento por voz', 'Flux de soutien vocal', 'Flujos de atención por voz'),
      c('Escalation rules', 'Regras de escalonamento', 'Règles d’escalade', 'Reglas de escalamiento'),
      c('Supervisor visibility', 'Visão do supervisor', 'Vue du superviseur', 'Visibilidad del supervisor'),
    ],
    stats: [
      { value: '8+', label: c('channels from one inbox', 'canais a partir de uma caixa', 'canaux depuis une seule boîte', 'canales desde una sola bandeja') },
      { value: '24/7', label: c('routing and replies that do not wait for a shift', 'roteamento e respostas que não esperam o turno', 'routage et réponses qui n’attendent pas le quart', 'enrutado y respuestas que no esperan el turno') },
      { value: '3x', label: c('faster handoff from bot to a person', 'passagem mais rápida do bot para uma pessoa', 'passage plus rapide du robot à une personne', 'paso más rápido del bot a una persona') },
      { value: '1', label: c('record for the whole customer journey', 'registro da jornada inteira do cliente', 'dossier pour tout le parcours du client', 'registro de todo el recorrido del cliente') },
    ],
    modules: [
      {
        icon: MessagesSquare,
        title: c('Unified inbox', 'Caixa única', 'Boîte unique', 'Bandeja única'),
        description: c(
          'Support, sales, and retention queues share one workspace and the full channel history.',
          'As filas de suporte, comercial e retenção dividem o mesmo espaço e o histórico de todos os canais.',
          'Les files de soutien, de vente et de rétention partagent le même espace et l’historique de tous les canaux.',
          'Las colas de soporte, ventas y retención comparten el mismo espacio y el historial de todos los canales.',
        ),
      },
      {
        icon: Bot,
        title: c('AI triage', 'Triagem com IA', 'Triage par IA', 'Triaje con IA'),
        description: c(
          'Read the intent, collect what is missing, and route the case before a person picks it up.',
          'Lê a intenção, pede o que falta e encaminha o caso antes de uma pessoa pegar.',
          'Lit l’intention, demande ce qui manque et achemine le cas avant qu’une personne le prenne.',
          'Lee la intención, pide lo que falta y encamina el caso antes de que una persona lo tome.',
        ),
      },
      {
        icon: Megaphone,
        title: c('Campaign activation', 'Disparo de campanhas', 'Lancement de campagnes', 'Activación de campañas'),
        description: c(
          'Send billing reminders, outage notices, upgrade offers, and win-back messages while the context stays attached.',
          'Dispara lembrete de faturamento, aviso de queda, oferta de upgrade e reconquista com o contexto grudado na conversa.',
          'Envoie rappels de facturation, avis de panne, offres de forfait et relances, avec le contexte collé à la conversation.',
          'Envía recordatorios de facturación, avisos de corte, ofertas de mejora y recuperación, con el contexto pegado a la conversación.',
        ),
      },
      {
        icon: PhoneCall,
        title: c('Voice desk', 'Mesa de voz', 'Bureau vocal', 'Mesa de voz'),
        description: c(
          'Run 0800 and callback flows on the same customer timeline as the digital channels.',
          'Conduz 0800 e retornos na mesma linha do tempo do cliente que os canais digitais usam.',
          'Mène le 0800 et les rappels sur la même ligne de temps client que les canaux numériques.',
          'Lleva el 0800 y las devoluciones de llamada en la misma línea de tiempo del cliente que usan los canales digitales.',
        ),
      },
      {
        icon: Workflow,
        title: c('SLA orchestration', 'Orquestração de SLA', 'Orchestration des SLA', 'Orquestación de SLA'),
        description: c(
          'Move conversations by rule, timer, and owner without someone policing the queue by hand.',
          'Move a conversa por regra, prazo e responsável, sem alguém vigiando a fila na mão.',
          'Fait avancer la conversation par règle, délai et responsable, sans surveillance manuelle de la file.',
          'Mueve la conversación por regla, plazo y responsable, sin vigilar la cola a mano.',
        ),
      },
      {
        icon: BarChart3,
        title: c('Supervisor analytics', 'Painel do supervisor', 'Tableau du superviseur', 'Panel del supervisor'),
        description: c(
          'See volume, response time, backlog, and conversion across every team and channel.',
          'Acompanha volume, tempo de resposta, fila e conversão em cada equipe e canal.',
          'Suit le volume, le délai de réponse, l’arriéré et la conversion pour chaque équipe et chaque canal.',
          'Sigue volumen, tiempo de respuesta, cola y conversión en cada equipo y canal.',
        ),
      },
    ],
    values: [
      {
        icon: MessageSquare,
        title: c('One context per customer', 'Um contexto por cliente', 'Un contexte par client', 'Un contexto por cliente'),
        description: c(
          'Sales and support stop losing the story between tools and channels that do not talk.',
          'Comercial e suporte deixam de perder a história entre ferramentas e canais que não se falam.',
          'Ventes et soutien cessent de perdre l’historique entre des outils et des canaux qui ne se parlent pas.',
          'Ventas y soporte dejan de perder la historia entre herramientas y canales que no se hablan.',
        ),
      },
      {
        icon: BellRing,
        title: c('Faster first response', 'Primeira resposta mais rápida', 'Première réponse plus rapide', 'Primera respuesta más rápida'),
        description: c(
          'The queue stays ordered, and urgent conversations move up before they stall.',
          'A fila fica ordenada e a conversa urgente sobe antes de empacar.',
          'La file reste ordonnée et la conversation urgente monte avant de rester bloquée.',
          'La cola queda ordenada y la conversación urgente sube antes de trabarse.',
        ),
      },
      {
        icon: ShieldCheck,
        title: c('The same service on every shift', 'O mesmo atendimento em todo turno', 'Le même service à chaque quart', 'El mismo servicio en cada turno'),
        description: c(
          'Templates, routing, and automation make the night shift work the way the day shift does.',
          'Modelos, roteamento e automação fazem o turno da noite operar como o do dia.',
          'Modèles, routage et automatisation font travailler le quart de nuit comme celui de jour.',
          'Plantillas, enrutado y automatización hacen que el turno de noche opere como el de día.',
        ),
      },
      {
        icon: Activity,
        title: c('Revenue stays in the thread', 'A receita continua na conversa', 'Le revenu reste dans le fil', 'El ingreso sigue en el hilo'),
        description: c(
          'Billing, retention, and outage messages stay tied to the same operational conversation.',
          'Faturamento, retenção e aviso de queda continuam na mesma conversa operacional.',
          'Facturation, rétention et avis de panne restent dans la même conversation d’exploitation.',
          'Facturación, retención y aviso de corte siguen en la misma conversación operativa.',
        ),
      },
    ],
    metricsLabel: c('Conversation throughput', 'Vazão das conversas', 'Débit des conversations', 'Caudal de conversaciones'),
    metricsTitle: c(
      'Keep the quality while the volume grows.',
      'Mantenha a qualidade enquanto o volume cresce.',
      'Gardez la qualité pendant que le volume monte.',
      'Mantén la calidad mientras el volumen crece.',
    ),
    metrics: [
      { value: '1', label: c('queue model shared by support, sales, and retention', 'modelo de fila compartilhado por suporte, comercial e retenção', 'modèle de file partagé par le soutien, les ventes et la rétention', 'modelo de cola compartido por soporte, ventas y retención') },
      { value: '24/7', label: c('coverage from automation before a person takes over', 'cobertura da automação antes de uma pessoa assumir', 'couverture par l’automatisation avant qu’une personne prenne le relais', 'cobertura de la automatización antes de que una persona tome el caso') },
      { value: '360°', label: c('customer context on every reply and campaign', 'contexto do cliente em cada resposta e campanha', 'contexte client sur chaque réponse et chaque campagne', 'contexto del cliente en cada respuesta y campaña') },
    ],
    ctaTitle: c(
      'Need a conversation stack that behaves like an operation?',
      'Precisa de uma camada de conversa que se comporte como operação?',
      'Vous cherchez une couche de conversation qui se comporte comme une exploitation?',
      '¿Necesitas una capa de conversación que se comporte como operación?',
    ),
    ctaDescription: c(
      'TurboChat is for teams that need speed, control of the channels, and a clear customer timeline across the whole lifecycle.',
      'O TurboChat é para equipes que precisam de velocidade, controle dos canais e uma linha do tempo clara do cliente em todo o ciclo.',
      'TurboChat s’adresse aux équipes qui ont besoin de vitesse, de maîtrise des canaux et d’une ligne de temps claire du client sur tout le cycle.',
      'TurboChat es para equipos que necesitan velocidad, control de los canales y una línea de tiempo clara del cliente en todo el ciclo.',
    ),
    footerNote: c(
      'TurboChat ties messaging, voice, and the operational flow together so the service context does not split.',
      'O TurboChat amarra mensagem, voz e o fluxo operacional para o contexto do atendimento não se partir.',
      'TurboChat relie messages, voix et flux d’exploitation pour que le contexte de service ne se divise pas.',
      'TurboChat ata mensajes, voz y el flujo operativo para que el contexto del servicio no se parta.',
    ),
  },
  turboagent: {
    slug: 'turboagent',
    name: 'TurboAgent',
    categoryLabel: c('Agent automation', 'Automação com agente', 'Automatisation par agent', 'Automatización con agente'),
    accent: '#7dd56f',
    comingSoon: true,
    badge: soon,
    heroTitle: c(
      'Automate the work between systems, teams, and the tasks that repeat.',
      'Automatize o trabalho entre sistemas, equipes e as tarefas que se repetem.',
      'Automatisez le travail entre les systèmes, les équipes et les tâches qui reviennent.',
      'Automatiza el trabajo entre sistemas, equipos y las tareas que se repiten.',
    ),
    heroSubtitle: c(
      'TurboAgent is an execution layer for operations: it reads signals, chooses the next step, opens work, updates records, and keeps a person in the loop when an approval matters.',
      'O TurboAgent é uma camada de execução da operação: lê sinais, escolhe o próximo passo, abre trabalho, atualiza registros e mantém uma pessoa no circuito quando a aprovação importa.',
      'TurboAgent est une couche d’exécution pour l’exploitation: il lit les signaux, choisit la prochaine étape, ouvre le travail, met à jour les dossiers et garde une personne dans la boucle quand une approbation compte.',
      'TurboAgent es una capa de ejecución de la operación: lee señales, elige el siguiente paso, abre trabajo, actualiza registros y deja a una persona en el circuito cuando la aprobación importa.',
    ),
    trustBadges: [
      c('Human-in-the-loop controls', 'Controle com pessoa no circuito', 'Contrôle avec une personne dans la boucle', 'Control con una persona en el circuito'),
      c('Cross-system actions', 'Ações entre sistemas', 'Actions entre systèmes', 'Acciones entre sistemas'),
      c('Event-driven automation', 'Automação por evento', 'Automatisation par événement', 'Automatización por evento'),
      c('Traceable runs', 'Execuções rastreáveis', 'Exécutions traçables', 'Ejecuciones rastreables'),
      c('Operational guardrails', 'Limites operacionais', 'Garde-fous d’exploitation', 'Límites operativos'),
    ],
    stats: [
      { value: '24/7', label: c('task execution that does not stop at shift change', 'execução que não para na troca de turno', 'exécution qui ne s’arrête pas au changement de quart', 'ejecución que no para en el cambio de turno') },
      { value: '60%', label: c('less repetitive handling for the ops team', 'menos trabalho repetitivo para a operação', 'moins de traitement répétitif pour l’exploitation', 'menos trabajo repetitivo para la operación') },
      { value: '1', label: c('agent layer across tools and processes', 'camada de agente sobre ferramentas e processos', 'couche d’agent sur les outils et les processus', 'capa de agente sobre herramientas y procesos') },
      { value: '100%', label: c('trace on every automated run', 'rastro em cada execução automática', 'trace sur chaque exécution automatisée', 'rastro en cada ejecución automática') },
    ],
    modules: [
      {
        icon: Workflow,
        title: c('Workflow orchestration', 'Orquestração de fluxos', 'Orchestration des flux', 'Orquestación de flujos'),
        description: c(
          'Chain triggers, approvals, actions, and follow-ups across the routines the team repeats every day.',
          'Encadeia gatilhos, aprovações, ações e retornos nas rotinas que a equipe repete todo dia.',
          'Enchaîne déclencheurs, approbations, actions et suivis dans les routines que l’équipe répète chaque jour.',
          'Encadena disparadores, aprobaciones, acciones y seguimientos en las rutinas que el equipo repite cada día.',
        ),
      },
      {
        icon: BrainCircuit,
        title: c('Reasoning engine', 'Motor de decisão', 'Moteur de décision', 'Motor de decisión'),
        description: c(
          'Interpret the request, classify the intent, and pick the next step from the business rules you already use.',
          'Interpreta o pedido, classifica a intenção e escolhe o próximo passo a partir das regras que a empresa já usa.',
          'Interprète la demande, classe l’intention et choisit la prochaine étape à partir des règles que l’entreprise utilise déjà.',
          'Interpreta el pedido, clasifica la intención y elige el siguiente paso a partir de las reglas que la empresa ya usa.',
        ),
      },
      {
        icon: Cable,
        title: c('Systems connectors', 'Conectores de sistemas', 'Connecteurs de systèmes', 'Conectores de sistemas'),
        description: c(
          'Read and update CRM, billing, network, support, and internal tools without the swivel-chair copy.',
          'Lê e atualiza CRM, faturamento, rede, suporte e ferramentas internas sem a cópia de tela em tela.',
          'Lit et met à jour CRM, facturation, réseau, soutien et outils internes sans recopier d’un écran à l’autre.',
          'Lee y actualiza CRM, facturación, red, soporte y herramientas internas sin copiar de pantalla en pantalla.',
        ),
      },
      {
        icon: BellRing,
        title: c('Alert handling', 'Tratamento de alertas', 'Traitement des alertes', 'Tratamiento de alertas'),
        description: c(
          'Turn alarms, anomalies, and queue events into a guided action instead of a notification nobody owns.',
          'Transforma alarme, anomalia e evento de fila em ação guiada, em vez de aviso sem dono.',
          'Transforme alarmes, anomalies et événements de file en action guidée, plutôt qu’en avis sans responsable.',
          'Convierte alarmas, anomalías y eventos de cola en una acción guiada, en lugar de un aviso sin dueño.',
        ),
      },
      {
        icon: ScanSearch,
        title: c('Knowledge actions', 'Ações com o conhecimento', 'Actions à partir du savoir', 'Acciones con el conocimiento'),
        description: c(
          'Use runbooks, internal docs, and past records to answer, escalate, or execute with the right context.',
          'Usa runbooks, documentos internos e o histórico para responder, escalar ou executar com o contexto certo.',
          'Utilise les guides, les documents internes et l’historique pour répondre, escalader ou exécuter avec le bon contexte.',
          'Usa guías, documentos internos y el historial para responder, escalar o ejecutar con el contexto correcto.',
        ),
      },
      {
        icon: ShieldCheck,
        title: c('Guardrails and approvals', 'Limites e aprovações', 'Garde-fous et approbations', 'Límites y aprobaciones'),
        description: c(
          'Decide what may run alone, what needs a person, and how every action is logged for audit.',
          'Define o que pode rodar sozinho, o que precisa de uma pessoa e como cada ação fica no registro de auditoria.',
          'Décidez ce qui peut tourner seul, ce qui exige une personne et comment chaque action reste au journal d’audit.',
          'Define qué puede correr solo, qué necesita a una persona y cómo cada acción queda en el registro de auditoría.',
        ),
      },
    ],
    values: [
      {
        icon: Bot,
        title: c('Less manual loop work', 'Menos volta manual', 'Moins de boucles manuelles', 'Menos vueltas manuales'),
        description: c(
          'Operators stop spending the day coordinating the same handoffs between tools, queues, and spreadsheets.',
          'O operador deixa de passar o dia coordenando a mesma passagem entre ferramenta, fila e planilha.',
          'L’opérateur cesse de passer la journée à coordonner les mêmes passages entre outil, file et tableur.',
          'El operador deja de pasar el día coordinando el mismo pase entre herramienta, cola y hoja de cálculo.',
        ),
      },
      {
        icon: GitBranch,
        title: c('Repeatable execution', 'Execução que se repete igual', 'Exécution reproductible', 'Ejecución que se repite igual'),
        description: c(
          'Critical routines become a standard flow instead of depending on who is online and what they remember.',
          'A rotina crítica vira fluxo padrão, em vez de depender de quem está online e do que a pessoa lembra.',
          'La routine critique devient un flux standard, au lieu de dépendre de qui est en ligne et de ce dont la personne se souvient.',
          'La rutina crítica se vuelve un flujo estándar, en lugar de depender de quién está en línea y de lo que recuerda.',
        ),
      },
      {
        icon: Lock,
        title: c('Controlled autonomy', 'Autonomia com controle', 'Autonomie encadrée', 'Autonomía con control'),
        description: c(
          'The agent can move quickly without skipping the rules, approvals, and safety limits you set.',
          'O agente anda rápido sem pular as regras, as aprovações e os limites de segurança que você definiu.',
          'L’agent avance vite sans sauter les règles, les approbations et les limites de sécurité que vous avez fixées.',
          'El agente avanza rápido sin saltarse las reglas, las aprobaciones y los límites de seguridad que definiste.',
        ),
      },
      {
        icon: Cloud,
        title: c('Scale without a hiring spike', 'Crescer sem pico de contratação', 'Croître sans pic d’embauche', 'Crecer sin un pico de contratación'),
        description: c(
          'As volume grows, the system absorbs more of the coordination before you need more people.',
          'Quando o volume sobe, o sistema absorve mais da coordenação antes de você precisar de mais gente.',
          'Quand le volume monte, le système absorbe davantage de coordination avant que vous ayez besoin de plus de monde.',
          'Cuando el volumen sube, el sistema absorbe más de la coordinación antes de que necesites más gente.',
        ),
      },
    ],
    metricsLabel: c('Execution impact', 'Impacto na execução', 'Impact sur l’exécution', 'Impacto en la ejecución'),
    metricsTitle: c(
      'Automate the coordination without losing control.',
      'Automatize a coordenação sem perder o controle.',
      'Automatisez la coordination sans perdre le contrôle.',
      'Automatiza la coordinación sin perder el control.',
    ),
    metrics: [
      { value: '1', label: c('operational brain for multi-step work across the stack', 'cérebro operacional para o trabalho em várias etapas', 'cerveau opérationnel pour le travail en plusieurs étapes', 'cerebro operativo para el trabajo de varios pasos') },
      { value: '60%', label: c('less repetitive intervention in flows that recur', 'menos intervenção repetitiva nos fluxos que voltam', 'moins d’intervention répétitive dans les flux qui reviennent', 'menos intervención repetitiva en los flujos que vuelven') },
      { value: '24/7', label: c('decisions and task progress with an audit trail', 'decisão e avanço da tarefa com trilha de auditoria', 'décision et avancement de la tâche avec piste d’audit', 'decisión y avance de la tarea con pista de auditoría') },
    ],
    ctaTitle: c(
      'Looking for automation that executes, not only suggests?',
      'Procura automação que executa, e não só sugere?',
      'Vous cherchez une automatisation qui exécute, pas seulement qui suggère?',
      '¿Buscas automatización que ejecuta, no solo que sugiere?',
    ),
    ctaDescription: c(
      'TurboAgent is for teams that want an AI layer tied to real workflows, real approvals, and output you can measure.',
      'O TurboAgent é para equipes que querem uma camada de IA ligada a fluxos reais, aprovações reais e resultado que dá para medir.',
      'TurboAgent s’adresse aux équipes qui veulent une couche d’IA branchée sur de vrais flux, de vraies approbations et un résultat mesurable.',
      'TurboAgent es para equipos que quieren una capa de IA atada a flujos reales, aprobaciones reales y un resultado que se puede medir.',
    ),
    footerNote: c(
      'TurboAgent turns operational intent into tracked actions across systems, teams, and recurring work.',
      'O TurboAgent transforma a intenção operacional em ação rastreada entre sistemas, equipes e o trabalho que se repete.',
      'TurboAgent transforme l’intention opérationnelle en actions suivies entre systèmes, équipes et travail récurrent.',
      'TurboAgent convierte la intención operativa en acciones rastreadas entre sistemas, equipos y el trabajo que se repite.',
    ),
  },
  turbogis: {
    slug: 'turbogis',
    name: 'TurboGIS',
    categoryLabel: c('Geospatial intelligence', 'Inteligência geoespacial', 'Intelligence géospatiale', 'Inteligencia geoespacial'),
    accent: '#f6c445',
    comingSoon: true,
    badge: soon,
    heroTitle: c(
      'Map every span, tower, route, and service area with operational precision.',
      'Mapeie cada lance, torre, rota e área de atendimento com precisão de operação.',
      'Cartographiez chaque portée, tour, route et zone de service avec la précision de l’exploitation.',
      'Mapea cada tramo, torre, ruta y zona de servicio con precisión de operación.',
    ),
    heroSubtitle: c(
      'TurboGIS gives engineering and field teams a live spatial layer for fiber, wireless, civil work, and coverage, so the map is an operating system instead of a file that goes stale.',
      'O TurboGIS dá à engenharia e ao campo uma camada espacial ao vivo de fibra, rádio, obra civil e cobertura, para o mapa ser sistema de operação e não arquivo que envelhece.',
      'TurboGIS donne à l’ingénierie et au terrain une couche spatiale en direct pour la fibre, le sans-fil, le génie civil et la couverture, pour que la carte soit un système d’exploitation et non un fichier qui vieillit.',
      'TurboGIS da a ingeniería y a campo una capa espacial en vivo de fibra, radio, obra civil y cobertura, para que el mapa sea un sistema de operación y no un archivo que envejece.',
    ),
    trustBadges: [
      c('Fiber and wireless ready', 'Pronto para fibra e rádio', 'Prêt pour la fibre et le sans-fil', 'Listo para fibra y radio'),
      c('Serviceability views', 'Visão de viabilidade', 'Vues de desserte', 'Vistas de viabilidad'),
      c('Tower inventories', 'Inventário de torres', 'Inventaire des tours', 'Inventario de torres'),
      c('Field-ready exports', 'Exportação pronta para o campo', 'Exports prêts pour le terrain', 'Exportaciones listas para campo'),
      c('Layer-based planning', 'Planejamento por camada', 'Planification par couche', 'Planeación por capa'),
    ],
    stats: [
      { value: '1', label: c('geospatial layer for network and field', 'camada geoespacial para rede e campo', 'couche géospatiale pour le réseau et le terrain', 'capa geoespacial para red y campo') },
      { value: '100%', label: c('asset trace from the map back to the record', 'rastro do ativo do mapa até o cadastro', 'trace de l’actif, de la carte jusqu’au dossier', 'rastro del activo desde el mapa hasta el registro') },
      { value: '3x', label: c('faster route review and planning cycles', 'ciclos de rota e planejamento mais rápidos', 'cycles de revue de route et de planification plus rapides', 'ciclos de revisión de ruta y planeación más rápidos') },
      {
        value: c('Live', 'Ao vivo', 'En direct', 'En vivo'),
        label: c('coverage and expansion you can see now', 'cobertura e expansão que dá para ver agora', 'couverture et expansion visibles maintenant', 'cobertura y expansión que se ven ahora'),
      },
    ],
    modules: [
      {
        icon: Map,
        title: c('Spatial asset registry', 'Cadastro espacial de ativos', 'Registre spatial des actifs', 'Registro espacial de activos'),
        description: c(
          'Document poles, fiber, towers, boxes, sectors, and linked infrastructure directly on the operational map.',
          'Documenta poste, fibra, torre, caixa, setor e a infraestrutura ligada direto no mapa da operação.',
          'Documente poteaux, fibre, tours, boîtiers, secteurs et l’infrastructure liée directement sur la carte d’exploitation.',
          'Documenta postes, fibra, torres, cajas, sectores y la infraestructura ligada directo en el mapa de la operación.',
        ),
      },
      {
        icon: Route,
        title: c('Topology and route design', 'Topologia e desenho de rota', 'Topologie et tracé de route', 'Topología y diseño de ruta'),
        description: c(
          'Plan expansions, backbone paths, and distribution options with the map and the network side by side.',
          'Planeja expansão, caminho de backbone e alternativa de distribuição com o mapa e a rede lado a lado.',
          'Planifie l’expansion, le chemin de backbone et les options de distribution avec la carte et le réseau côte à côte.',
          'Planea la expansión, el camino del backbone y las alternativas de distribución con el mapa y la red lado a lado.',
        ),
      },
      {
        icon: ScanSearch,
        title: c('Field survey workflows', 'Fluxo de levantamento de campo', 'Flux de relevé terrain', 'Flujo de levantamiento de campo'),
        description: c(
          'Capture updates from inspections, rollouts, and incidents without a disconnected map export.',
          'Registra atualização de vistoria, implantação e incidente sem exportar o mapa para outro arquivo.',
          'Saisit les mises à jour d’inspection, de déploiement et d’incident sans exporter la carte vers un autre fichier.',
          'Registra actualizaciones de inspección, despliegue e incidente sin exportar el mapa a otro archivo.',
        ),
      },
      {
        icon: Layers3,
        title: c('Capacity overlays', 'Camadas de capacidade', 'Couches de capacité', 'Capas de capacidad'),
        description: c(
          'See occupancy, constraints, and regional demand on the same map engineering already uses.',
          'Vê ocupação, restrição e demanda da região no mesmo mapa que a engenharia já usa.',
          'Voit l’occupation, les contraintes et la demande régionale sur la même carte que l’ingénierie utilise déjà.',
          'Ve ocupación, restricciones y demanda de la región en el mismo mapa que ingeniería ya usa.',
        ),
      },
      {
        icon: Building2,
        title: c('Tower and site management', 'Torres e sites', 'Tours et sites', 'Torres y sitios'),
        description: c(
          'Track structures, contracts, equipment, and notes for every strategic location on the network.',
          'Acompanha estrutura, contrato, equipamento e anotação de cada ponto estratégico da rede.',
          'Suit structures, contrats, équipements et notes de chaque point stratégique du réseau.',
          'Sigue estructura, contrato, equipo y notas de cada punto estratégico de la red.',
        ),
      },
      {
        icon: Network,
        title: c('Serviceability intelligence', 'Viabilidade de atendimento', 'Intelligence de desserte', 'Inteligencia de viabilidad'),
        description: c(
          'See where you can activate, where you still need to build, and how close the network already is.',
          'Mostra onde dá para ativar, onde ainda precisa construir e o quanto a rede já está perto.',
          'Montre où vous pouvez activer, où il reste à construire et à quel point le réseau est déjà proche.',
          'Muestra dónde puedes activar, dónde todavía hay que construir y qué tan cerca ya está la red.',
        ),
      },
    ],
    values: [
      {
        icon: Globe,
        title: c('One geographic source of truth', 'Uma fonte geográfica só', 'Une seule source géographique', 'Una sola fuente geográfica'),
        description: c(
          'Planning, field, and leadership stop working from different versions of the network.',
          'Planejamento, campo e liderança deixam de trabalhar com versões diferentes da rede.',
          'Planification, terrain et direction cessent de travailler avec des versions différentes du réseau.',
          'Planeación, campo y dirección dejan de trabajar con versiones distintas de la red.',
        ),
      },
      {
        icon: BellRing,
        title: c('Faster field response', 'Campo chega mais rápido', 'Le terrain arrive plus vite', 'Campo llega más rápido'),
        description: c(
          'Teams reach the incident and the service point with the right location the first time.',
          'A equipe chega no incidente e no ponto de atendimento com o lugar certo na primeira ida.',
          'L’équipe arrive à l’incident et au point de service avec le bon endroit du premier coup.',
          'El equipo llega al incidente y al punto de servicio con el lugar correcto a la primera.',
        ),
      },
      {
        icon: ShieldCheck,
        title: c('Safer planning decisions', 'Decisão de planejamento mais segura', 'Décisions de planification plus sûres', 'Decisiones de planeación más seguras'),
        description: c(
          'Capacity, route, and site choices sit on spatial evidence instead of scattered notes.',
          'Capacidade, rota e escolha de site ficam apoiadas em evidência espacial, não em anotação solta.',
          'Capacité, route et choix de site s’appuient sur des preuves spatiales, pas sur des notes éparses.',
          'Capacidad, ruta y elección de sitio se apoyan en evidencia espacial, no en notas sueltas.',
        ),
      },
      {
        icon: Earth,
        title: c('Expansion you can defend', 'Expansão que se sustenta', 'Une expansion que vous pouvez défendre', 'Expansión que se puede defender'),
        description: c(
          'Coverage and infrastructure layers make it easier to show where the next rollout should go.',
          'As camadas de cobertura e infraestrutura facilitam mostrar onde a próxima implantação deve ir.',
          'Les couches de couverture et d’infrastructure aident à montrer où le prochain déploiement doit aller.',
          'Las capas de cobertura e infraestructura ayudan a mostrar dónde debe ir el siguiente despliegue.',
        ),
      },
    ],
    metricsLabel: c('Spatial impact', 'Impacto espacial', 'Impact spatial', 'Impacto espacial'),
    metricsTitle: c(
      'Treat the map as a live operating system.',
      'Trate o mapa como um sistema de operação ao vivo.',
      'Traitez la carte comme un système d’exploitation en direct.',
      'Trata el mapa como un sistema de operación en vivo.',
    ),
    metrics: [
      { value: '1', label: c('map-centric workspace for engineering, field, and serviceability', 'espaço centrado no mapa para engenharia, campo e viabilidade', 'espace centré sur la carte pour l’ingénierie, le terrain et la desserte', 'espacio centrado en el mapa para ingeniería, campo y viabilidad') },
      {
        value: c('Meter', 'Metro', 'Mètre', 'Metro'),
        label: c('planning context for route and site decisions', 'contexto de planejamento para rota e site', 'contexte de planification pour la route et le site', 'contexto de planeación para ruta y sitio'),
      },
      {
        value: c('Live', 'Ao vivo', 'En direct', 'En vivo'),
        label: c('visibility of coverage, occupancy, and readiness to expand', 'visão de cobertura, ocupação e prontidão para expandir', 'visibilité de la couverture, de l’occupation et de la capacité d’expansion', 'visibilidad de cobertura, ocupación y disposición para expandir'),
      },
    ],
    ctaTitle: c(
      'Still running network geography from static files and maps that do not match?',
      'Ainda opera a geografia da rede com arquivo estático e mapa que não bate?',
      'Vous exploitez encore la géographie du réseau avec des fichiers statiques et des cartes qui ne concordent pas?',
      '¿Sigues operando la geografía de la red con archivos estáticos y mapas que no coinciden?',
    ),
    ctaDescription: c(
      'TurboGIS gives network operations a geospatial layer built for planning, field work, and asset intelligence.',
      'O TurboGIS dá à operação de rede uma camada geoespacial feita para planejamento, campo e inteligência de ativos.',
      'TurboGIS donne à l’exploitation du réseau une couche géospatiale faite pour la planification, le terrain et l’intelligence des actifs.',
      'TurboGIS da a la operación de red una capa geoespacial hecha para planeación, campo e inteligencia de activos.',
    ),
    footerNote: c(
      'TurboGIS turns infrastructure geography into an operational asset for planning, serviceability, and field execution.',
      'O TurboGIS transforma a geografia da infraestrutura em ativo operacional para planejamento, viabilidade e execução de campo.',
      'TurboGIS transforme la géographie de l’infrastructure en actif opérationnel pour la planification, la desserte et l’exécution terrain.',
      'TurboGIS convierte la geografía de la infraestructura en un activo operativo para planeación, viabilidad y ejecución de campo.',
    ),
  },
  turboinfrabase: {
    slug: 'turboinfrabase',
    name: 'TurboInfraBase',
    categoryLabel: c('Infrastructure database', 'Base de infraestrutura', 'Base d’infrastructure', 'Base de infraestructura'),
    accent: '#ff6b6b',
    comingSoon: true,
    badge: soon,
    heroTitle: c(
      'One infrastructure database across utilities, telecom, and public assets.',
      'Uma base de infraestrutura para concessionárias, telecom e ativos públicos.',
      'Une base d’infrastructure pour les services publics, les télécoms et les actifs publics.',
      'Una base de infraestructura para servicios públicos, telecom y activos públicos.',
    ),
    heroSubtitle: c(
      'TurboInfraBase gathers power, water, gas, telecom, and civil records into a governed base that teams can query, audit, and connect straight to TurboGIS.',
      'O TurboInfraBase junta cadastro de energia, água, gás, telecom e obra civil numa base governada que as equipes consultam, auditam e ligam direto ao TurboGIS.',
      'TurboInfraBase rassemble les dossiers d’électricité, d’eau, de gaz, de télécoms et de génie civil dans une base gouvernée que les équipes consultent, auditent et branchent directement à TurboGIS.',
      'TurboInfraBase junta registros de electricidad, agua, gas, telecom y obra civil en una base gobernada que los equipos consultan, auditan y conectan directo a TurboGIS.',
    ),
    trustBadges: [
      c('Power network coverage', 'Cobertura da rede elétrica', 'Couverture du réseau électrique', 'Cobertura de la red eléctrica'),
      c('Water and gas records', 'Cadastro de água e gás', 'Dossiers d’eau et de gaz', 'Registros de agua y gas'),
      c('Telecom asset support', 'Suporte a ativos de telecom', 'Soutien aux actifs télécoms', 'Soporte a activos de telecom'),
      c('Governance controls', 'Controles de governança', 'Contrôles de gouvernance', 'Controles de gobernanza'),
      c('GIS-native structure', 'Estrutura nativa de GIS', 'Structure native GIS', 'Estructura nativa de GIS'),
    ],
    stats: [
      { value: '5+', label: c('infrastructure domains in one governed model', 'domínios de infraestrutura num modelo governado', 'domaines d’infrastructure dans un modèle gouverné', 'dominios de infraestructura en un modelo gobernado') },
      { value: '1', label: c('master registry of assets and ownership', 'cadastro mestre de ativos e titularidade', 'registre maître des actifs et de la propriété', 'registro maestro de activos y titularidad') },
      { value: '100%', label: c('trace for record changes and source syncs', 'rastro de alteração e de sincronização da origem', 'trace des changements et des synchros de source', 'rastro de cambios y de sincronización de origen') },
      {
        value: 'GIS',
        label: c('alignment with the map and the field layers', 'alinhamento com o mapa e as camadas de campo', 'alignement avec la carte et les couches terrain', 'alineación con el mapa y las capas de campo'),
      },
    ],
    modules: [
      {
        icon: Database,
        title: c('Multi-utility registry', 'Cadastro multiutilitário', 'Registre multi-services', 'Registro multiservicio'),
        description: c(
          'Store power, water, gas, telecom, and civil infrastructure in one normalized operational base.',
          'Guarda energia, água, gás, telecom e infraestrutura civil numa base operacional normalizada.',
          'Range électricité, eau, gaz, télécoms et infrastructure civile dans une base opérationnelle normalisée.',
          'Guarda electricidad, agua, gas, telecom e infraestructura civil en una base operativa normalizada.',
        ),
      },
      {
        icon: Layers3,
        title: c('Standards and schemas', 'Padrões e esquemas', 'Normes et schémas', 'Estándares y esquemas'),
        description: c(
          'Keep asset structure, classification, and required metadata consistent across every domain.',
          'Mantém estrutura do ativo, classificação e metadados obrigatórios iguais em todos os domínios.',
          'Garde la structure de l’actif, la classification et les métadonnées obligatoires cohérentes dans chaque domaine.',
          'Mantiene la estructura del activo, la clasificación y los metadatos obligatorios iguales en cada dominio.',
        ),
      },
      {
        icon: Landmark,
        title: c('Ownership and legal context', 'Titularidade e contexto legal', 'Propriété et contexte juridique', 'Titularidad y contexto legal'),
        description: c(
          'Track concession, ownership, contract, and documents next to the operational asset record.',
          'Acompanha concessão, titularidade, contrato e documentos ao lado do cadastro operacional do ativo.',
          'Suit concession, propriété, contrat et documents à côté du dossier opérationnel de l’actif.',
          'Sigue concesión, titularidad, contrato y documentos junto al registro operativo del activo.',
        ),
      },
      {
        icon: Wrench,
        title: c('Condition and maintenance history', 'Estado e histórico de manutenção', 'État et historique d’entretien', 'Estado e historial de mantenimiento'),
        description: c(
          'Record condition, inspections, and interventions so the database matches what the field sees.',
          'Registra estado, vistoria e intervenção para a base refletir o que o campo encontra.',
          'Enregistre l’état, les inspections et les interventions pour que la base reflète ce que le terrain voit.',
          'Registra estado, inspección e intervención para que la base refleje lo que el campo encuentra.',
        ),
      },
      {
        icon: Server,
        title: c('API and sync connectors', 'API e conectores de sincronização', 'API et connecteurs de synchro', 'API y conectores de sincronización'),
        description: c(
          'Feed the registry from mapping tools, operational systems, and pipelines without typing the same asset twice.',
          'Alimenta o cadastro a partir do mapa, dos sistemas da operação e dos pipelines sem digitar o mesmo ativo duas vezes.',
          'Alimente le registre à partir de la carte, des systèmes d’exploitation et des pipelines sans saisir le même actif deux fois.',
          'Alimenta el registro desde el mapa, los sistemas de operación y los pipelines sin capturar el mismo activo dos veces.',
        ),
      },
      {
        icon: Lock,
        title: c('Governance and permissions', 'Governança e permissões', 'Gouvernance et permissions', 'Gobernanza y permisos'),
        description: c(
          'Control who creates, edits, validates, and audits records across teams and contractors.',
          'Controla quem cria, edita, valida e audita o cadastro entre equipes e empreiteiras.',
          'Contrôle qui crée, modifie, valide et audite les dossiers entre les équipes et les entrepreneurs.',
          'Controla quién crea, edita, valida y audita los registros entre equipos y contratistas.',
        ),
      },
    ],
    values: [
      {
        icon: Database,
        title: c('Centralized master data', 'Dado mestre centralizado', 'Données maîtres centralisées', 'Dato maestro centralizado'),
        description: c(
          'Critical infrastructure records leave the departmental silo and the spreadsheet that nobody trusts.',
          'O cadastro crítico sai do silo do departamento e da planilha em que ninguém confia.',
          'Le dossier critique quitte le silo du service et le tableur auquel personne ne se fie.',
          'El registro crítico sale del silo del área y de la hoja en la que nadie confía.',
        ),
      },
      {
        icon: Activity,
        title: c('Fewer duplicate records', 'Menos cadastro duplicado', 'Moins de dossiers en double', 'Menos registros duplicados'),
        description: c(
          'Teams work from the same controlled base instead of rebuilding the inventory in parallel.',
          'As equipes trabalham na mesma base controlada, em vez de reconstruir o inventário em paralelo.',
          'Les équipes travaillent sur la même base contrôlée, au lieu de reconstruire l’inventaire en parallèle.',
          'Los equipos trabajan sobre la misma base controlada, en lugar de reconstruir el inventario en paralelo.',
        ),
      },
      {
        icon: ShieldCheck,
        title: c('A stronger audit posture', 'Postura de auditoria mais firme', 'Une posture d’audit plus solide', 'Una postura de auditoría más firme'),
        description: c(
          'Governance, ownership, and change history support an audit in regulated environments.',
          'Governança, titularidade e histórico de mudança sustentam auditoria em ambiente regulado.',
          'Gouvernance, propriété et historique des changements soutiennent l’audit en milieu réglementé.',
          'Gobernanza, titularidad e historial de cambios sostienen la auditoría en un entorno regulado.',
        ),
      },
      {
        icon: Globe,
        title: c('Cross-domain planning', 'Planejamento entre domínios', 'Planification entre domaines', 'Planeación entre dominios'),
        description: c(
          'Infrastructure from different sectors can be read together for expansion, maintenance, and risk.',
          'Infraestrutura de setores diferentes pode ser lida junta para expansão, manutenção e risco.',
          'L’infrastructure de secteurs différents se lit ensemble pour l’expansion, l’entretien et le risque.',
          'La infraestructura de distintos sectores se lee junta para expansión, mantenimiento y riesgo.',
        ),
      },
    ],
    metricsLabel: c('Data integrity', 'Integridade dos dados', 'Intégrité des données', 'Integridad de los datos'),
    metricsTitle: c(
      'Turn scattered infrastructure records into a governed operational base.',
      'Transforme cadastros espalhados numa base operacional governada.',
      'Transformez des dossiers épars en une base opérationnelle gouvernée.',
      'Convierte registros dispersos en una base operativa gobernada.',
    ),
    metrics: [
      { value: '1', label: c('shared registry for utilities, telecom, and civil assets', 'cadastro compartilhado de utilidades, telecom e ativos civis', 'registre partagé pour les services, les télécoms et les actifs civils', 'registro compartido de servicios, telecom y activos civiles') },
      { value: '5+', label: c('domains under one data and governance model', 'domínios sob um modelo de dados e governança', 'domaines sous un seul modèle de données et de gouvernance', 'dominios bajo un modelo de datos y gobernanza') },
      { value: '100%', label: c('trace for updates, validation, and integration syncs', 'rastro de atualização, validação e sincronização', 'trace des mises à jour, de la validation et des synchros', 'rastro de actualizaciones, validación y sincronización') },
    ],
    ctaTitle: c(
      'Need a governed infrastructure base instead of another disconnected inventory?',
      'Precisa de uma base de infraestrutura governada, e não de mais um inventário solto?',
      'Vous avez besoin d’une base d’infrastructure gouvernée, plutôt que d’un autre inventaire déconnecté?',
      '¿Necesitas una base de infraestructura gobernada, en lugar de otro inventario suelto?',
    ),
    ctaDescription: c(
      'TurboInfraBase gives engineering, GIS, and operations a shared record system for infrastructure that crosses sectors.',
      'O TurboInfraBase dá à engenharia, ao GIS e à operação um cadastro compartilhado da infraestrutura que cruza setores.',
      'TurboInfraBase donne à l’ingénierie, au GIS et à l’exploitation un dossier partagé de l’infrastructure qui traverse les secteurs.',
      'TurboInfraBase da a ingeniería, a GIS y a la operación un registro compartido de la infraestructura que cruza sectores.',
    ),
    footerNote: c(
      'TurboInfraBase centralizes infrastructure records so mapping, planning, and governance run on the same base.',
      'O TurboInfraBase centraliza o cadastro de infraestrutura para mapa, planejamento e governança rodarem na mesma base.',
      'TurboInfraBase centralise les dossiers d’infrastructure pour que carte, planification et gouvernance tournent sur la même base.',
      'TurboInfraBase centraliza los registros de infraestructura para que mapa, planeación y gobernanza corran sobre la misma base.',
    ),
  },
}

export const PRODUCT_SITE_SLUGS = Object.keys(PRODUCT_SITES)
