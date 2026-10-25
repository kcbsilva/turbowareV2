"use client";

import { useState, useEffect, useCallback, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../assets/TurboISP-logo.png";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
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
  AppWindow,
  ImageIcon,
} from "lucide-react";
import { LANGS, type Lang, pick } from "./_components/constants";
import { useSiteLang } from "./_components/site-lang";
import { PricingSection } from "./_components/PricingSection";
import { turbowareTitle, useDocumentTitle } from "@/lib/document-title";

// Drop your screenshots in /public/slides/ with these filenames.
const SLIDES = [
  {
    id: "worktop",
    image: "/slides/worktop.png",
    icon: AppWindow,
    tag: { en: "Desktop / Worktop", pt: "Desktop / Worktop", fr: "Bureau / Worktop", es: "Escritorio / Worktop" },
    title: {
      en: "The feel of a desktop, just like you're used to",
      pt: "A sensação de um desktop, do jeito que você já conhece",
      fr: "L'ambiance d'un bureau, comme celui que vous connaissez déjà",
      es: "La sensación de un escritorio, como el que ya conoces",
    },
    description: {
      en: "Windows, a taskbar, and apps you already know how to use. Open the map, subscribers, billing — drag them around like you would on your own computer.",
      pt: "Janelas, barra de tarefas e aplicativos que você já sabe usar. Abra o mapa, os assinantes, o faturamento — arraste como no seu próprio computador.",
      fr: "Fenêtres, barre des tâches et applications que vous savez déjà utiliser. Ouvrez la carte, les abonnés, la facturation — déplacez-les comme sur votre ordinateur.",
      es: "Ventanas, barra de tareas y apps que ya sabes usar. Abre el mapa, los abonados y la facturación, y muévelos como en tu propia computadora.",
    },
  },
  {
    id: "network-map",
    image: "/slides/network-map.png",
    icon: Map,
    tag: { en: "GIS / Network Map", pt: "GIS / Mapa de Rede", fr: "SIG / Carte réseau", es: "SIG / Mapa de red" },
    title: {
      en: "Your entire network on one map",
      pt: "Toda sua rede em um mapa",
      fr: "Tout votre réseau sur une carte",
      es: "Toda tu red en un mapa",
    },
    description: {
      en: "Every PoP, fiber run, splitter and subscriber — georeferenced and live. Click any element to see its status.",
      pt: "Cada PoP, fibra, splitter e assinante — georreferenciado e ao vivo. Clique em qualquer elemento e veja o status.",
      fr: "Chaque POP, fibre, splitter et abonné — géoréférencé et en direct. Cliquez sur un élément pour voir son état.",
      es: "Cada POP, fibra, splitter y abonado, georreferenciados y en vivo. Haz clic en cualquier elemento para ver su estado.",
    },
  },
  {
    id: "noc-dashboard",
    image: "/slides/noc-dashboard.png",
    icon: Activity,
    tag: { en: "NOC / Monitoring", pt: "NOC / Monitoramento", fr: "NOC / Supervision", es: "NOC / Monitoreo" },
    title: {
      en: "See problems before customers call",
      pt: "Veja problemas antes do cliente ligar",
      fr: "Voyez les pannes avant l'appel du client",
      es: "Ve los problemas antes de que el cliente llame",
    },
    description: {
      en: "Real-time telemetry from OLTs, radios and routers. Alerts grouped by root cause — one fiber cut, one incident, not 400 tickets.",
      pt: "Telemetria em tempo real de OLTs, rádios e roteadores. Alertas agrupados por causa raiz — um rompimento, um incidente, não 400 chamados.",
      fr: "Télémétrie en temps réel des OLT, radios et routeurs. Alertes groupées par cause racine — une coupure, un incident, pas 400 tickets.",
      es: "Telemetría en tiempo real de OLT, radios y routers. Alertas agrupadas por causa raíz: un corte, un incidente, no 400 tickets.",
    },
  },
  {
    id: "subscriber-360",
    image: "/slides/subscriber-360.png",
    icon: Users,
    tag: { en: "CRM / Subscribers", pt: "CRM / Assinantes", fr: "CRM / Abonnés", es: "CRM / Abonados" },
    title: {
      en: "The whole customer on one screen",
      pt: "O cliente inteiro em uma tela",
      fr: "Tout le client sur un écran",
      es: "El cliente completo en una pantalla",
    },
    description: {
      en: "Plan, signal levels, invoices, tickets, connection history. Support answers in seconds because everything is already there.",
      pt: "Plano, níveis de sinal, faturas, chamados e histórico de conexão. O suporte responde em segundos porque está tudo ali.",
      fr: "Forfait, niveaux de signal, factures, tickets, historique de connexion. Le soutien répond en quelques secondes — tout est déjà là.",
      es: "Plan, niveles de señal, facturas, tickets e historial de conexión. Soporte responde en segundos porque todo ya está ahí.",
    },
  },
  {
    id: "billing",
    image: "/slides/billing.png",
    icon: Receipt,
    tag: { en: "Billing / Finance", pt: "Cobrança / Financeiro", fr: "Facturation / Finances", es: "Facturación / Finanzas" },
    title: {
      en: "Billing that runs itself",
      pt: "Cobrança que roda sozinha",
      fr: "Une facturation autonome",
      es: "Facturación que funciona sola",
    },
    description: {
      en: "Invoices, payment links, automatic suspension and reactivation. Delinquency drops without your team lifting a finger.",
      pt: "Faturas, links de pagamento, suspensão e reativação automáticas. A inadimplência cai sem a equipe mover um dedo.",
      fr: "Factures, liens de paiement, suspension et réactivation automatiques. Les impayés baissent sans effort de votre équipe.",
      es: "Facturas, links de pago, suspensión y reactivación automáticas. La morosidad baja sin que tu equipo mueva un dedo.",
    },
  },
  {
    id: "field-ops",
    image: "/slides/field-ops.png",
    icon: Wrench,
    tag: { en: "Field Ops", pt: "Campo", fr: "Terrain", es: "Campo" },
    title: {
      en: "Technicians with a plan, not a phone call",
      pt: "Técnicos com rota, não com telefonema",
      fr: "Des techniciens avec un plan, pas un appel",
      es: "Técnicos con una ruta, no con una llamada",
    },
    description: {
      en: "Work orders with routes, materials and checklists on mobile. Installations and repairs tracked from dispatch to signature.",
      pt: "Ordens de serviço com rota, materiais e checklist no celular. Instalações e reparos rastreados do despacho à assinatura.",
      fr: "Bons de travail avec itinéraires, matériel et listes de contrôle sur mobile. Installations et réparations suivies de la répartition à la signature.",
      es: "Órdenes de servicio con ruta, materiales y checklist en el celular. Instalaciones y reparaciones seguidas del despacho a la firma.",
    },
  },
  {
    id: "reports",
    image: "/slides/reports.png",
    icon: BarChart3,
    tag: { en: "Reports / Analytics", pt: "Relatórios / Analytics", fr: "Rapports / Analytique", es: "Reportes / Analítica" },
    title: {
      en: "Numbers that run the business",
      pt: "Números que comandam o negócio",
      fr: "Les chiffres qui pilotent l'activité",
      es: "Números que mandan en el negocio",
    },
    description: {
      en: "Churn, ARPU, network utilization, growth by region. 99 KPIs updated live — decisions on data, not gut feeling.",
      pt: "Churn, ARPU, utilização de rede, crescimento por região. 99 KPIs ao vivo — decisão com dado, não com achismo.",
      fr: "Taux de désabonnement, ARPU, utilisation du réseau, croissance par région. 99 indicateurs en direct — des décisions sur les données, pas à l'instinct.",
      es: "Churn, ARPU, uso de red y crecimiento por región. 99 KPIs en vivo: decisiones con datos, no con intuición.",
    },
  },
];

const CAPABILITIES = [
  { en: "Self-hosted", pt: "No seu servidor", fr: "Auto-hébergé", es: "En tu servidor" },
  { en: "Multi-operator", pt: "Multi-operadora", fr: "Multi-opérateur", es: "Multioperador" },
  { en: "GPON / Wireless", pt: "GPON / Wireless", fr: "GPON / Sans fil", es: "GPON / Inalámbrico" },
  { en: "Real-time ops", pt: "Operação em tempo real", fr: "Exploitation en temps réel", es: "Operación en tiempo real" },
  { en: "99.9% uptime", pt: "99,9% de disponibilidade", fr: "99,9% de disponibilité", es: "99,9% de disponibilidad" },
];

const VALUES = [
  {
    title: { en: "Unified Operations", pt: "Operações unificadas", fr: "Opérations unifiées", es: "Operaciones unificadas" },
    description: { en: "CRM, NOC, Finance, GIS—one platform, one source of truth.", pt: "CRM, NOC, financeiro e GIS — uma plataforma, uma fonte única de dados.", fr: "CRM, NOC, facturation, SIG — une plateforme, une source unique de vérité.", es: "CRM, NOC, finanzas y SIG: una plataforma, una sola fuente de datos." },
    icon: Radio,
  },
  {
    title: { en: "Real-time Intelligence", pt: "Inteligência em tempo real", fr: "Intelligence en temps réel", es: "Inteligencia en tiempo real" },
    description: { en: "See your entire operation as it happens. 99 KPIs tracked live.", pt: "Veja toda a sua operação acontecendo. 99 KPIs acompanhados ao vivo.", fr: "Voyez toute votre opération en direct. 99 indicateurs suivis en direct.", es: "Ve toda tu operación mientras ocurre. 99 KPIs en vivo." },
    icon: Zap,
  },
  {
    title: { en: "Automatic Remediation", pt: "Remediação automática", fr: "Correction automatique", es: "Remediación automática" },
    description: { en: "Alerts trigger workflows. Problems solve themselves before humans know.", pt: "Alertas disparam fluxos. Problemas se resolvem antes de alguém perceber.", fr: "Les alertes déclenchent les flux. Les problèmes se règlent avant qu'on s'en rende compte.", es: "Las alertas disparan flujos. Los problemas se resuelven antes de que alguien se entere." },
    icon: Shield,
  },
  {
    title: { en: "Scale Predictably", pt: "Escala previsível", fr: "Croissance maîtrisée", es: "Escala previsible" },
    description: { en: "Built for ISPs. From 100 subscribers to 100K. No rewrite. No bottlenecks.", pt: "Feito para provedores. De 100 a 100 mil assinantes. Sem reescrever o sistema.", fr: "Conçu pour les FAI. De 100 à 100 000 abonnés. Pas de refonte.", es: "Hecho para ISPs. De 100 a 100 mil abonados. Sin reescribir el sistema." },
    icon: Globe,
  },
];

const SECTION_NAV = [
  { id: "platform", label: { en: "Platform", pt: "Plataforma", fr: "Plateforme", es: "Plataforma" } },
  { id: "why", label: { en: "Why TurboISP", pt: "Por que TurboISP", fr: "Pourquoi TurboISP", es: "Por qué TurboISP" } },
  { id: "results", label: { en: "Results", pt: "Resultados", fr: "Résultats", es: "Resultados" } },
  { id: "pricing", label: { en: "Pricing", pt: "Planos", fr: "Tarifs", es: "Precios" } },
] as const;

export default function TurboISPSitePage() {
  const { lang, setLang } = useSiteLang();
  useDocumentTitle(turbowareTitle("TurboISP"));
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState<(typeof SECTION_NAV)[number]["id"]>("platform");
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });
  const sectionNavRef = useRef<HTMLDivElement>(null);
  const sectionLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const scrollLockRef = useRef<(typeof SECTION_NAV)[number]["id"] | null>(null);

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

  useEffect(() => {
    const ids = SECTION_NAV.map((item) => item.id);
    const hash = window.location.hash.replace("#", "");
    if (ids.includes(hash as (typeof ids)[number])) {
      setActiveSection(hash as (typeof SECTION_NAV)[number]["id"]);
    }

    const updateActive = () => {
      if (scrollLockRef.current) return;
      const offset = 110;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - offset <= 0) current = id;
      }
      setActiveSection(current as (typeof SECTION_NAV)[number]["id"]);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, []);

  const measureIndicator = useCallback(() => {
    const nav = sectionNavRef.current;
    const link = sectionLinkRefs.current[activeSection];
    if (!nav || !link) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    setIndicator({
      left: linkRect.left - navRect.left,
      width: linkRect.width,
      ready: true,
    });
  }, [activeSection]);

  useLayoutEffect(() => {
    measureIndicator();
  }, [measureIndicator, lang]);

  useEffect(() => {
    const nav = sectionNavRef.current;
    if (!nav || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measureIndicator());
    observer.observe(nav);
    window.addEventListener("resize", measureIndicator);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureIndicator);
    };
  }, [measureIndicator]);

  const scrollToSection = (id: (typeof SECTION_NAV)[number]["id"]) => {
    scrollLockRef.current = id;
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    window.setTimeout(() => {
      if (scrollLockRef.current === id) scrollLockRef.current = null;
    }, 700);
  };

  const slide = SLIDES[slideIndex];
  const SlideIcon = slide.icon;

  return (
    <div id="top" className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-white text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 lg:px-12 border-b border-slate-100 bg-white/85 backdrop-blur-md">
        <a href="#top" className="flex items-center">
          <Image src={logo} alt="TurboISP" priority className="h-16 w-auto -my-4" />
        </a>

        <div
          ref={sectionNavRef}
          className="relative hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 pb-1"
        >
          {SECTION_NAV.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                ref={(el) => {
                  sectionLinkRefs.current[item.id] = el;
                }}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection(item.id);
                }}
                className={`relative py-1 transition-colors duration-300 ${
                  isActive ? "text-sky-600" : "hover:text-sky-600"
                }`}
              >
                {s(item.label)}
              </a>
            );
          })}
          <Link href="/turboisp/wiki" className="relative py-1 hover:text-sky-600 transition-colors duration-300">
            {s({ en: "Wiki", pt: "Wiki", fr: "Wiki", es: "Wiki" })}
          </Link>
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 h-[2.5px] origin-left rounded-full bg-sky-600"
            style={{
              width: indicator.width,
              opacity: indicator.ready ? 1 : 0,
              transform: `translateX(${indicator.left}px)`,
              transition:
                "transform 480ms cubic-bezier(0.22, 1.35, 0.36, 1), width 480ms cubic-bezier(0.22, 1.35, 0.36, 1), opacity 200ms ease",
            }}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="relative inline-flex h-9 items-center">
            <span className="sr-only">{s({ en: "Language", pt: "Idioma", fr: "Langue", es: "Idioma" })}</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="h-9 appearance-none rounded-full border border-slate-800 bg-white pl-3.5 pr-8 text-sm font-semibold text-black cursor-pointer hover:bg-slate-50 focus:outline-none focus:border-sky-500"
            >
              {LANGS.map(({ code, label }) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-black" />
          </label>
        </div>
      </nav>

      {/* Hero: This is TurboISP + carousel */}
      <section id="platform" className="relative px-6 pt-20 pb-24 lg:px-12 scroll-mt-20">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6">
            {s({ en: "This is ", pt: "Isto é o ", fr: "Voici ", es: "Esto es " })}
            <span className="bg-gradient-to-r from-sky-500 to-blue-700 bg-clip-text text-transparent">TurboISP</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {s({
              en: "CRM, NOC, billing and network map — one platform running your whole operation. See it for yourself.",
              pt: "CRM, NOC, faturamento e mapa de rede — uma plataforma rodando toda a sua operação. Veja com seus próprios olhos.",
              fr: "CRM, NOC, facturation et carte réseau — une plateforme pour toute votre opération. Voyez par vous-même.",
              es: "CRM, NOC, facturación y mapa de red: una plataforma para toda tu operación. Míralo tú mismo.",
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
            {/* Image area — matches ~1920×838 worktop screenshots */}
            <div className="relative aspect-[1920/838] bg-slate-900">
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
                  className="absolute inset-0 h-full w-full object-contain"
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
              aria-label={s({ en: "Previous slide", pt: "Slide anterior", fr: "Diapositive précédente", es: "Diapositiva anterior" })}
              className="p-3 rounded-full border border-slate-300 text-slate-600 hover:border-sky-500 hover:text-sky-600 transition bg-white"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Tab-style dots with labels on desktop */}
            <div className="hidden md:flex flex-wrap justify-center gap-2 max-w-3xl">
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
              aria-label={s({ en: "Next slide", pt: "Próximo slide", fr: "Diapositive suivante", es: "Diapositiva siguiente" })}
              className="p-3 rounded-full border border-slate-300 text-slate-600 hover:border-sky-500 hover:text-sky-600 transition bg-white"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        {/* CTAs under carousel */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-14">
          <a href="#pricing" className="px-8 py-4 border border-sky-600 rounded-lg font-semibold text-sky-700 hover:bg-sky-50 transition text-center">
            {s({ en: "See pricing", pt: "Ver planos", fr: "Voir les tarifs", es: "Ver precios" })}
          </a>
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
      <section id="why" className="relative px-6 lg:px-12 py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sky-600 text-sm font-mono uppercase tracking-wider">{s({ en: "Why TurboISP", pt: "Por que TurboISP", fr: "Pourquoi TurboISP", es: "Por qué TurboISP" })}</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 text-slate-900">
              {s({
                en: "Built for ISP Operations",
                pt: "Feito para a operação do provedor",
                fr: "Conçu pour l'exploitation des FAI",
                es: "Hecho para la operación del ISP",
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
      <section id="results" className="relative px-6 lg:px-12 py-24 bg-gradient-to-r from-sky-600 to-blue-700 text-white scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="text-5xl font-bold mb-2">99.9%</div>
              <div className="text-sky-100">{s({ en: "Uptime SLA", pt: "SLA de disponibilidade", fr: "SLA de disponibilité", es: "SLA de disponibilidad" })}</div>
            </div>
            <div className="p-8">
              <div className="text-5xl font-bold mb-2">45%</div>
              <div className="text-sky-100">{s({ en: "Less rework", pt: "Menos retrabalho", fr: "Moins de reprises", es: "Menos retrabajo" })}</div>
            </div>
            <div className="p-8">
              <div className="text-5xl font-bold mb-2">99</div>
              <div className="text-sky-100">{s({ en: "Real-time KPIs", pt: "KPIs em tempo real", fr: "Indicateurs en temps réel", es: "KPIs en tiempo real" })}</div>
            </div>
          </div>
        </div>
      </section>

      <PricingSection lang={lang} />

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-12 border-t border-slate-200 text-center text-slate-500 text-sm">
        <p>
          <Link href="/turboisp/wiki" className="text-sky-600 hover:text-sky-700">
            {s({ en: "Wiki", pt: "Wiki", fr: "Wiki", es: "Wiki" })}
          </Link>
          <span className="mx-2 text-slate-300">·</span>
          {new Date().getFullYear()} - TurboISP
        </p>
      </footer>
    </div>
  );
}
