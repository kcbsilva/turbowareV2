import type { LucideIcon } from "lucide-react";
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
} from "lucide-react";

export type ProductSiteCard = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type ProductSiteMetric = {
  value: string;
  label: string;
};

export type ProductSiteContent = {
  slug: string;
  name: string;
  category: string;
  accent: string;
  comingSoon: boolean;
  badge: string;
  heroTitle: string;
  heroSubtitle: string;
  trustBadges: string[];
  stats: ProductSiteMetric[];
  modules: ProductSiteCard[];
  values: ProductSiteCard[];
  metricsLabel: string;
  metricsTitle: string;
  metrics: ProductSiteMetric[];
  ctaTitle: string;
  ctaDescription: string;
  footerNote: string;
};

export const PRODUCT_SITES: Record<string, ProductSiteContent> = {
  turbochat: {
    slug: "turbochat",
    name: "TurboChat",
    category: "Customer Conversations",
    accent: "#ff8a3d",
    comingSoon: true,
    badge: "Coming soon",
    heroTitle: "Support, sales, and retention in one conversation layer.",
    heroSubtitle:
      "TurboChat unifies WhatsApp, Instagram, Telegram, voice, and operator workflows so your team can answer faster, automate the repetitive parts, and keep the full customer context in one place.",
    trustBadges: [
      "WhatsApp and Meta operations",
      "Telegram ready",
      "Voice support workflows",
      "Escalation rules",
      "Supervisor visibility",
    ],
    stats: [
      { value: "8+", label: "channels orchestrated from one inbox" },
      { value: "24/7", label: "automated routing and reply coverage" },
      { value: "3x", label: "faster handoff between bot and human agents" },
      { value: "1", label: "conversation record per customer journey" },
    ],
    modules: [
      {
        icon: MessagesSquare,
        title: "Unified inbox",
        description:
          "Handle support, commercial, and retention queues in a single workspace with full channel history.",
      },
      {
        icon: Bot,
        title: "AI triage",
        description:
          "Classify intent, collect missing information, and route the case before a human agent touches it.",
      },
      {
        icon: Megaphone,
        title: "Campaign activation",
        description:
          "Launch proactive messages for billing reminders, outages, upgrades, and win-back plays.",
      },
      {
        icon: PhoneCall,
        title: "Voice desk",
        description:
          "Coordinate 0800 and callback flows with the same customer timeline used by digital channels.",
      },
      {
        icon: Workflow,
        title: "SLA orchestration",
        description:
          "Move conversations through rules, timers, and ownership states without manual queue policing.",
      },
      {
        icon: BarChart3,
        title: "Supervisor analytics",
        description:
          "Track volume, response time, backlog, and conversion signals across every team and channel.",
      },
    ],
    values: [
      {
        icon: MessageSquare,
        title: "One context per customer",
        description:
          "Commercial and support teams stop losing history between tools and disconnected channels.",
      },
      {
        icon: BellRing,
        title: "Faster first response",
        description:
          "Queues stay organized and high-priority conversations are escalated before they stall.",
      },
      {
        icon: ShieldCheck,
        title: "Consistent service quality",
        description:
          "Templates, routing rules, and automations make every shift operate the same way.",
      },
      {
        icon: Activity,
        title: "Revenue continuity",
        description:
          "Billing, retention, and outage communications stay tied to the same operational conversation flow.",
      },
    ],
    metricsLabel: "Conversation throughput",
    metricsTitle: "Keep quality high while message volume scales.",
    metrics: [
      { value: "1", label: "shared queueing model across support, sales, and retention" },
      { value: "24/7", label: "coverage with automation before human takeover" },
      { value: "360°", label: "customer context for every interaction and campaign" },
    ],
    ctaTitle: "Need a conversation stack that behaves like an operation, not a chat toy?",
    ctaDescription:
      "TurboChat is built for teams that need response speed, channel control, and a clear customer timeline across the entire lifecycle.",
    footerNote:
      "TurboChat connects customer messaging, voice, and operational workflows without fragmenting the service context.",
  },
  turboagent: {
    slug: "turboagent",
    name: "TurboAgent",
    category: "Agent Automation",
    accent: "#7dd56f",
    comingSoon: true,
    badge: "Coming soon",
    heroTitle: "Automate the work between systems, teams, and recurring tasks.",
    heroSubtitle:
      "TurboAgent acts as an execution layer for operations: reading signals, deciding next steps, opening tasks, updating records, and keeping humans in the loop when approvals matter.",
    trustBadges: [
      "Human-in-the-loop controls",
      "Cross-system actions",
      "Event-driven automation",
      "Traceable runs",
      "Operational guardrails",
    ],
    stats: [
      { value: "24/7", label: "task execution without shift boundaries" },
      { value: "60%", label: "less repetitive ops handling" },
      { value: "1", label: "agent layer across tools and processes" },
      { value: "100%", label: "traceability for every automated run" },
    ],
    modules: [
      {
        icon: Workflow,
        title: "Workflow orchestration",
        description:
          "Chain triggers, approvals, actions, and follow-ups across the operational routines your team repeats every day.",
      },
      {
        icon: BrainCircuit,
        title: "Reasoning engine",
        description:
          "Interpret requests, classify intent, and decide the next best step based on structured business rules.",
      },
      {
        icon: Cable,
        title: "Systems connectors",
        description:
          "Read and update records across CRM, billing, network, support, and internal tooling without swivel-chair work.",
      },
      {
        icon: BellRing,
        title: "Alert handling",
        description:
          "Turn alarms, anomalies, and queue events into guided operational actions instead of passive notifications.",
      },
      {
        icon: ScanSearch,
        title: "Knowledge actions",
        description:
          "Use internal documentation, playbooks, and historical records to answer, escalate, or execute with context.",
      },
      {
        icon: ShieldCheck,
        title: "Guardrails and approvals",
        description:
          "Define what can run autonomously, what needs validation, and how every action is logged for audit.",
      },
    ],
    values: [
      {
        icon: Bot,
        title: "Less manual loop work",
        description:
          "Operators stop spending time on repetitive coordination tasks between tools, queues, and spreadsheets.",
      },
      {
        icon: GitBranch,
        title: "Repeatable execution",
        description:
          "Critical routines become standardized flows instead of depending on who is online and what they remember.",
      },
      {
        icon: Lock,
        title: "Controlled autonomy",
        description:
          "The agent can move fast without bypassing the business rules, approvals, and safety boundaries you require.",
      },
      {
        icon: Cloud,
        title: "Scale without headcount spikes",
        description:
          "As volume grows, the system absorbs more of the operational burden before you need more people.",
      },
    ],
    metricsLabel: "Execution impact",
    metricsTitle: "Automate coordination work without losing control.",
    metrics: [
      { value: "1", label: "operational brain for multi-step actions across your stack" },
      { value: "60%", label: "less repetitive intervention in recurring flows" },
      { value: "24/7", label: "decisioning and task progression with clear audit trails" },
    ],
    ctaTitle: "Looking for automation that executes, not just suggests?",
    ctaDescription:
      "TurboAgent is for teams that want an AI layer connected to real workflows, real approvals, and measurable operational output.",
    footerNote:
      "TurboAgent turns operational intent into tracked actions across systems, teams, and recurring work.",
  },
  turbogis: {
    slug: "turbogis",
    name: "TurboGIS",
    category: "Geospatial Intelligence",
    accent: "#f6c445",
    comingSoon: true,
    badge: "Coming soon",
    heroTitle: "Map every span, tower, route, and service area with operational precision.",
    heroSubtitle:
      "TurboGIS gives engineering and field teams a live spatial layer for fiber, wireless, civil infrastructure, and service coverage, turning mapping into an operational system instead of a static document.",
    trustBadges: [
      "Fiber and wireless ready",
      "Serviceability views",
      "Tower inventories",
      "Field-ready exports",
      "Layer-based planning",
    ],
    stats: [
      { value: "1", label: "geospatial layer for network and field operations" },
      { value: "100%", label: "asset traceability from map to record" },
      { value: "3x", label: "faster route review and planning cycles" },
      { value: "Live", label: "coverage and expansion visibility" },
    ],
    modules: [
      {
        icon: Map,
        title: "Spatial asset registry",
        description:
          "Document poles, fibers, towers, boxes, sectors, and linked infrastructure directly on the operational map.",
      },
      {
        icon: Route,
        title: "Topology and route design",
        description:
          "Plan expansions, backbone paths, and distribution alternatives with geographic and network context side by side.",
      },
      {
        icon: ScanSearch,
        title: "Field survey workflows",
        description:
          "Capture updates from inspections, rollouts, and incidents without relying on disconnected map exports.",
      },
      {
        icon: Layers3,
        title: "Capacity overlays",
        description:
          "Visualize occupancy, constraints, and regional demand on top of the same map used by engineering teams.",
      },
      {
        icon: Building2,
        title: "Tower and site management",
        description:
          "Track structures, contracts, equipment, and operational notes for every strategic location in the network.",
      },
      {
        icon: Network,
        title: "Serviceability intelligence",
        description:
          "Understand where you can activate, where you need expansion, and how close the network already is.",
      },
    ],
    values: [
      {
        icon: Globe,
        title: "One geographic source of truth",
        description:
          "Planning, field, and leadership teams stop working from different versions of the network reality.",
      },
      {
        icon: BellRing,
        title: "Faster field response",
        description:
          "Teams reach incidents and service points with the right location context the first time.",
      },
      {
        icon: ShieldCheck,
        title: "Safer planning decisions",
        description:
          "Capacity, route, and site choices become grounded in spatial evidence instead of fragmented notes.",
      },
      {
        icon: Earth,
        title: "Expansion with confidence",
        description:
          "Coverage and infrastructure layers make it easier to justify where the next rollout should happen.",
      },
    ],
    metricsLabel: "Spatial impact",
    metricsTitle: "Treat mapping as a live operational system.",
    metrics: [
      { value: "1", label: "map-centric workspace for engineering, field, and serviceability" },
      { value: "Meter", label: "level planning context for route and site decisions" },
      { value: "Live", label: "visibility into coverage, occupancy, and expansion readiness" },
    ],
    ctaTitle: "Still managing network geography with static files and disconnected maps?",
    ctaDescription:
      "TurboGIS gives network operations a geospatial layer built for planning, field execution, and asset intelligence.",
    footerNote:
      "TurboGIS turns infrastructure geography into an operational asset for planning, serviceability, and field execution.",
  },
  turboinfrabase: {
    slug: "turboinfrabase",
    name: "TurboInfraBase",
    category: "Infrastructure Database",
    accent: "#ff6b6b",
    comingSoon: true,
    badge: "Coming soon",
    heroTitle: "Build one infrastructure database across utilities, telecom, and public assets.",
    heroSubtitle:
      "TurboInfraBase consolidates hydro, water, gas, telecom, and civil records into a governed base layer that teams can query, audit, and connect directly to TurboGIS workflows.",
    trustBadges: [
      "Hydro coverage",
      "Water and gas records",
      "Telecom asset support",
      "Governance controls",
      "GIS-native structure",
    ],
    stats: [
      { value: "5+", label: "infrastructure domains in one governed model" },
      { value: "1", label: "master registry across assets and ownership data" },
      { value: "100%", label: "traceability for record changes and source syncs" },
      { value: "GIS", label: "ready alignment with mapping and field layers" },
    ],
    modules: [
      {
        icon: Database,
        title: "Multi-utility registry",
        description:
          "Store hydro, water, gas, telecom, and civil infrastructure in a single normalized operational base.",
      },
      {
        icon: Layers3,
        title: "Standards and schemas",
        description:
          "Keep consistent asset structures, classification rules, and metadata requirements across every domain.",
      },
      {
        icon: Landmark,
        title: "Ownership and legal context",
        description:
          "Track concession, ownership, contract, and documentation links alongside the operational asset record.",
      },
      {
        icon: Wrench,
        title: "Condition and maintenance history",
        description:
          "Register operational state, inspections, and interventions so the database reflects field reality.",
      },
      {
        icon: Server,
        title: "API and sync connectors",
        description:
          "Integrate the registry with mapping tools, operational systems, and data pipelines without duplicate entry.",
      },
      {
        icon: Lock,
        title: "Governance and permissions",
        description:
          "Control who creates, edits, validates, and audits infrastructure records across teams and contractors.",
      },
    ],
    values: [
      {
        icon: Database,
        title: "Centralized master data",
        description:
          "Critical infrastructure records stop living in departmental silos and disconnected spreadsheets.",
      },
      {
        icon: Activity,
        title: "Fewer duplicate records",
        description:
          "Teams work from the same controlled base instead of rebuilding asset inventories in parallel.",
      },
      {
        icon: ShieldCheck,
        title: "Stronger compliance posture",
        description:
          "Governance, ownership context, and change history support auditability across regulated environments.",
      },
      {
        icon: Globe,
        title: "Cross-domain planning",
        description:
          "Infrastructure from different sectors can be analyzed together for expansion, maintenance, and risk.",
      },
    ],
    metricsLabel: "Data integrity",
    metricsTitle: "Turn fragmented infrastructure records into a governed operational base.",
    metrics: [
      { value: "1", label: "shared registry for utilities, telecom, and civil assets" },
      { value: "5+", label: "domains managed under one data and governance model" },
      { value: "100%", label: "traceability for updates, validation, and integration syncs" },
    ],
    ctaTitle: "Need a governed infrastructure base instead of another disconnected inventory?",
    ctaDescription:
      "TurboInfraBase gives engineering, GIS, and operations teams a shared record system for infrastructure that spans multiple sectors.",
    footerNote:
      "TurboInfraBase centralizes infrastructure records so mapping, planning, and governance run on the same base layer.",
  },
};

export const PRODUCT_SITE_SLUGS = Object.keys(PRODUCT_SITES);
