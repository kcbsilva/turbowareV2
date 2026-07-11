"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Zap,
  Shield,
  Globe,
  Radio,
  Map,
  Activity,
  Users,
  Receipt,
  Wrench,
  BarChart3,
  ImageIcon,
} from "lucide-react";
import { type Lang, pick } from "./_components/constants";

// Drop your screenshots in /public/slides/ with these filenames.
const SLIDES = [
  {
    id: "network-map",
    image: "/slides/network-map.png",
    icon: Map,
    tag: { en: "GIS / Network Map", pt: "GIS / Mapa de Rede", fr: "SIG / Carte Réseau" },
    title: {
      en: "Your entire network on one map",
      pt: "Toda sua rede em um mapa",
      fr: "Tout votre réseau sur une carte",
    },
    description: {
      en: "Every PoP, fiber run, splitter and subscriber — georeferenced and live. Click any element to see its status.",
      pt: "Cada PoP, fibra, splitter e assinante — georreferenciado e ao vivo. Clique em qualquer elemento e veja o status.",
      fr: "Chaque PoP, fibre, splitter et abonné — géoréférencé et en direct. Cliquez sur un élément pour voir son état.",
    },
  },
  {
    id: "noc-dashboard",
    image: "/slides/noc-dashboard.png",
    icon: Activity,
    tag: { en: "NOC / Monitoring", pt: "NOC / Monitoramento", fr: "NOC / Supervision" },
    title: {
      en: "See problems before customers call",
      pt: "Veja problemas antes do cliente ligar",
      fr: "Voyez les pannes avant l'appel du client",
    },
    description: {
      en: "Real-time telemetry from OLTs, radios and routers. Alerts grouped by root cause — one fiber cut, one incident, not 400 tickets.",
      pt: "Telemetria em tempo real de OLTs, rádios e roteadores. Alertas agrupados por causa raiz — um rompimento, um incidente, não 400 tickets.",
      fr: "Télémétrie temps réel des OLT, radios et routeurs. Alertes groupées par cause racine — une coupure, un incident, pas 400 tickets.",
    },
  },
  {
    id: "subscriber-360",
    image: "/slides/subscriber-360.png",
    icon: Users,
    tag: { en: "CRM / Subscribers", pt: "CRM / Assinantes", fr: "CRM / Abonnés" },
    title: {
      en: "The whole customer on one screen",
      pt: "O cliente inteiro em uma tela",
      fr: "Tout le client sur un écran",
    },
    description: {
      en: "Plan, signal levels, invoices, tickets, connection history. Support answers in seconds because everything is already there.",
      pt: "Plano, níveis de sinal, faturas, tickets, histórico de conexão. Suporte responde em segundos porque está tudo ali.",
      fr: "Forfait, niveaux de signal, factures, tickets, historique de connexion. Le support répond en secondes — tout est déjà là.",
    },
  },
  {
    id: "billing",
    image: "/slides/billing.png",
    icon: Receipt,
    tag: { en: "Billing / Finance", pt: "Billing / Financeiro", fr: "Facturation / Finance" },
    title: {
      en: "Billing that runs itself",
      pt: "Cobrança que roda sozinha",
      fr: "Une facturation autonome",
    },
    description: {
      en: "Invoices, payment links, automatic suspension and reactivation. Delinquency drops without your team lifting a finger.",
      pt: "Faturas, links de pagamento, suspensão e reativação automáticas. Inadimplência cai sem sua equipe levantar um dedo.",
      fr: "Factures, liens de paiement, suspension et réactivation automatiques. Les impayés baissent sans effort de votre équipe.",
    },
  },
  {
    id: "field-ops",
    image: "/slides/field-ops.png",
    icon: Wrench,
    tag: { en: "Field Ops", pt: "Campo", fr: "Terrain" },
    title: {
      en: "Technicians with a plan, not a phone call",
      pt: "Técnicos com rota, não com telefonema",
      fr: "Des techniciens avec un plan, pas un appel",
    },
    description: {
      en: "Work orders with routes, materials and checklists on mobile. Installations and repairs tracked from dispatch to signature.",
      pt: "Ordens de serviço com rota, materiais e checklist no celular. Instalações e reparos rastreados do despacho à assinatura.",
      fr: "Ordres de travail avec itinéraires, matériel et checklists sur mobile. Installations et réparations suivies du départ à la signature.",
    },
  },
  {
    id: "reports",
    image: "/slides/reports.png",
    icon: BarChart3,
    tag: { en: "Reports / Analytics", pt: "Relatórios / Analytics", fr: "Rapports / Analytique" },
    title: {
      en: "Numbers that run the business",
      pt: "Números que comandam o negócio",
      fr: "Les chiffres qui pilotent l'activité",
    },
    description: {
      en: "Churn, ARPU, network utilization, growth by region. 99 KPIs updated live — decisions on data, not gut feeling.",
      pt: "Churn, ARPU, utilização de rede, crescimento por região. 99 KPIs ao vivo — decisão com dado, não com achismo.",
      fr: "Churn, ARPU, utilisation réseau, croissance par région. 99 KPIs en direct — des décisions sur données, pas à l'instinct.",
    },
  },
];

const CAPABILITIES = [
  { en: "Self-hosted", pt: "Self-hosted", fr: "Auto-hébergé" },
  { en: "Multi-operator", pt: "Multi-operadora", fr: "Multi-opérateur" },
  { en: "GPON / Wireless", pt: "GPON / Wireless", fr: "GPON / Sans fil" },
  { en: "Real-time ops", pt: "Ops em tempo real", fr: "Ops temps réel" },
  { en: "99.9% uptime", pt: "99.9% de disponibilidade", fr: "99,9% de disponibilité" },
];

const VALUES = [
  {
    title: { en: "Unified Operations", pt: "Operações Unificadas", fr: "Opérations Unifiées" },
    description: { en: "CRM, NOC, Finance, GIS—one platform, one source of truth.", pt: "CRM, NOC, Finance, GIS—uma plataforma, uma verdade única.", fr: "CRM, NOC, Finance, SIG—une plateforme, une source de vérité." },
    icon: Radio,
  },
  {
    title: { en: "Real-time Intelligence", pt: "Inteligência em Tempo Real", fr: "Intelligence Temps Réel" },
    description: { en: "See your entire operation as it happens. 99 KPIs tracked live.", pt: "Veja toda sua operação acontecendo. 99 KPIs rastreados ao vivo.", fr: "Voyez toute votre opération en direct. 99 KPIs suivi en direct." },
    icon: Zap,
  },
  {
    title: { en: "Automatic Remediation", pt: "Remediação Automática", fr: "Remédiation Automatique" },
    description: { en: "Alerts trigger workflows. Problems solve themselves before humans know.", pt: "Alertas disparam workflows. Problemas se resolvem automaticamente.", fr: "Les alertes déclenchent les workflows. Les problèmes se résolvent d'eux-mêmes." },
    icon: Shield,
  },
  {
    title: { en: "Scale Predictably", pt: "Escale Previsível", fr: "Mise à l'échelle Prévisible" },
    description: { en: "Built for ISPs. From 100 subscribers to 100K. No rewrite. No bottlenecks.", pt: "Construído para ISPs. De 100 para 100K assinantes. Sem reescrita.", fr: "Construit pour les FAI. De 100 à 100K abonnés. Pas de refonte." },
    icon: Globe,
  },
];

export default function TurboISPSitePage() {
  const [lang, setLang] = useState<Lang>("pt");
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  const s = <T extends Record<Lang, string>>(map: T) => pick(map, lang);

  const nextSlide = useCallback(
    () => setSlideIndex((prev) => (prev + 1) % SLIDES.length),
    [],
  );
  const prevSlide = () => setSlideIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [paused, nextSlide]);

  const slide = SLIDES[slideIndex];
  const SlideIcon = slide.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-white text-slate-900">
      {/* Navigation */}
      <nav className="relative z-40 flex items-center justify-between px-6 py-6 lg:px-12 border-b border-slate-100">
        <div className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-sky-500 to-blue-700 bg-clip-text text-transparent">turbo</span>
          <span className="text-slate-900">isp</span>
        </div>

        <div className="flex items-center gap-8">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="bg-transparent text-sm border border-slate-300 px-3 py-2 rounded text-slate-700 cursor-pointer hover:border-sky-500 transition"
          >
            <option value="en">EN</option>
            <option value="pt">PT</option>
            <option value="fr">FR</option>
          </select>
          <Link href="/admin/login" className="text-sm px-4 py-2 rounded border border-sky-600 text-sky-700 hover:bg-sky-600 hover:text-white transition">
            {s({ en: "Login", pt: "Entrar", fr: "Connexion" })}
          </Link>
        </div>
      </nav>

      {/* Hero: This is TurboISP + carousel */}
      <section className="relative px-6 pt-20 pb-24 lg:px-12">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6">
            {s({ en: "This is ", pt: "Isto é o ", fr: "Voici " })}
            <span className="bg-gradient-to-r from-sky-500 to-blue-700 bg-clip-text text-transparent">TurboISP</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {s({
              en: "CRM, NOC, billing and network map — one platform running your whole operation. See it for yourself.",
              pt: "CRM, NOC, billing e mapa de rede — uma plataforma rodando toda sua operação. Veja com seus olhos.",
              fr: "CRM, NOC, facturation et carte réseau — une plateforme pour toute votre opération. Voyez par vous-même.",
            })}
          </p>
        </div>

        {/* Carousel */}
        <div
          className="max-w-6xl mx-auto"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xl shadow-slate-200/60">
            {/* Image area — 16:9 */}
            <div className="relative aspect-video bg-slate-100">
              {broken[slide.id] ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-sky-50 to-slate-100">
                  <SlideIcon className="w-16 h-16 text-sky-300" strokeWidth={1.25} />
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-mono">
                    <ImageIcon className="w-4 h-4" />
                    public{slide.image}
                  </div>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.image}
                  alt={slide.title[lang]}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setBroken((b) => ({ ...b, [slide.id]: true }))}
                />
              )}

              {/* Caption overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent px-8 pt-20 pb-8 text-left">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-300/30 text-sky-200 text-xs font-mono uppercase tracking-wider mb-3">
                  <SlideIcon className="w-3.5 h-3.5" />
                  {slide.tag[lang]}
                </span>
                <h2 className="text-2xl lg:text-4xl font-bold text-white mb-2">{slide.title[lang]}</h2>
                <p className="text-slate-200 text-sm lg:text-base max-w-2xl">{slide.description[lang]}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prevSlide}
              aria-label={s({ en: "Previous slide", pt: "Slide anterior", fr: "Diapositive précédente" })}
              className="p-3 rounded-full border border-slate-300 text-slate-600 hover:border-sky-500 hover:text-sky-600 transition bg-white"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Tab-style dots with labels on desktop */}
            <div className="hidden md:flex gap-2">
              {SLIDES.map((sl, idx) => (
                <button
                  key={sl.id}
                  onClick={() => setSlideIndex(idx)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                    idx === slideIndex
                      ? "bg-sky-600 text-white"
                      : "bg-white border border-slate-200 text-slate-500 hover:border-sky-300"
                  }`}
                >
                  {sl.tag[lang]}
                </button>
              ))}
            </div>
            <div className="flex md:hidden gap-2">
              {SLIDES.map((sl, idx) => (
                <button
                  key={sl.id}
                  onClick={() => setSlideIndex(idx)}
                  aria-label={sl.tag[lang]}
                  className={`h-2 rounded-full transition ${
                    idx === slideIndex ? "bg-sky-500 w-8" : "bg-slate-300 w-2"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              aria-label={s({ en: "Next slide", pt: "Próximo slide", fr: "Diapositive suivante" })}
              className="p-3 rounded-full border border-slate-300 text-slate-600 hover:border-sky-500 hover:text-sky-600 transition bg-white"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        {/* CTAs under carousel */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-14">
          <Link href="/turboisp/register" className="px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-sky-200 transition text-center">
            {s({ en: "Start free trial", pt: "Comece grátis", fr: "Essai gratuit" })}
          </Link>
          <Link href="/turboisp/pricing" className="px-8 py-4 border border-sky-600 rounded-lg font-semibold text-sky-700 hover:bg-sky-50 transition text-center">
            {s({ en: "See pricing", pt: "Ver planos", fr: "Voir les tarifs" })}
          </Link>
        </div>

        {/* Capabilities Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {CAPABILITIES.map((cap, i) => (
            <span key={i} className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm text-slate-600 shadow-sm">
              {cap[lang]}
            </span>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="relative px-6 lg:px-12 py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sky-600 text-sm font-mono uppercase tracking-wider">{s({ en: "Why TurboISP", pt: "Por que TurboISP", fr: "Pourquoi TurboISP" })}</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 text-slate-900">
              {s({
                en: "Built for ISP Operations",
                pt: "Construído para Operações ISP",
                fr: "Construit pour les Opérations FAI",
              })}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div key={idx} className="p-8 bg-white border border-slate-200 rounded-xl hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition group">
                  <Icon className="w-8 h-8 text-sky-500 mb-4 group-hover:text-blue-600 transition" />
                  <h3 className="text-xl font-bold mb-3 text-slate-900">{value.title[lang]}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{value.description[lang]}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="relative px-6 lg:px-12 py-24 bg-gradient-to-r from-sky-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="text-5xl font-bold mb-2">99.9%</div>
              <div className="text-sky-100">{s({ en: "Uptime SLA", pt: "Uptime SLA", fr: "SLA de disponibilité" })}</div>
            </div>
            <div className="p-8">
              <div className="text-5xl font-bold mb-2">45%</div>
              <div className="text-sky-100">{s({ en: "Less rework", pt: "Menos retrabalho", fr: "Moins de retravail" })}</div>
            </div>
            <div className="p-8">
              <div className="text-5xl font-bold mb-2">99</div>
              <div className="text-sky-100">{s({ en: "Real-time KPIs", pt: "KPIs em tempo real", fr: "KPIs temps réel" })}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 lg:px-12 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900">
            {s({
              en: "Ready to Unify Your Operation?",
              pt: "Pronto para Unificar sua Operação?",
              fr: "Prêt à Unifier votre Opération ?",
            })}
          </h2>
          <p className="text-lg text-slate-600 mb-12">
            {s({
              en: "Start your free 14-day trial. Provisioning takes minutes.",
              pt: "Comece seu trial gratuito de 14 dias. Provisionamento em minutos.",
              fr: "Commencez votre essai gratuit de 14 jours. Provisionnement en minutes.",
            })}
          </p>
          <Link href="/turboisp/register" className="inline-block px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-sky-200 transition">
            {s({ en: "Start free trial", pt: "Comece grátis", fr: "Essai gratuit" })}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-12 border-t border-slate-200 text-center text-slate-500 text-sm">
        <p>© 2026 TurboISP. {s({ en: "All rights reserved.", pt: "Todos os direitos reservados.", fr: "Tous droits réservés." })}</p>
      </footer>
    </div>
  );
}
