"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../assets/TurboISP-logo.png";
import { TurboispPageTranslations as tr } from "./translation";
import {
  Network,
  Users,
  DollarSign,
  Wrench,
  BarChart3,
  ShoppingCart,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Radio,
  Map,
  Headphones,
  BookOpen,
} from "lucide-react";

type Lang = "en" | "pt" | "fr";

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
  { code: "fr", label: "FR" },
];

// ── Stats — values are universal numbers, labels are translated inline ────────
const STATS = [
  {
    value: "All-in-One",
    label: {
      en: "CRM, NOC & GIS",
      pt: "CRM, NOC e GIS",
      fr: "CRM, NOC et SIG",
    },
  },
  {
    value: "Multi-Tenant",
    label: {
      en: "ISP Architecture",
      pt: "Arquitetura multi-tenant",
      fr: "Architecture multi-locataire",
    },
  },
  {
    value: "99.9%",
    label: { en: "Uptime SLA", pt: "Uptime SLA", fr: "SLA de disponibilité" },
  },
  {
    value: "45%",
    label: {
      en: "Less rework",
      pt: "Menos retrabalho",
      fr: "Moins de retravail",
    },
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TurboISPSitePage() {
  const [lang, setLang] = useState<Lang>("pt");

  /** Pick the correct string from the translation file */
  const t = (key: keyof typeof tr) => tr[key][lang];

  // ── Translated module + value arrays (re-derived on every lang change) ────
  const MODULES = [
    {
      icon: Users,
      title: t("module_subscribers_title"),
      desc: t("module_subscribers_desc"),
      accent: "#fca311",
      bg: "rgba(252,163,17,0.08)",
      border: "rgba(252,163,17,0.18)",
    },
    {
      icon: Network,
      title: t("module_noc_title"),
      desc: t("module_noc_desc"),
      accent: "#1AABF0",
      bg: "rgba(26,171,240,0.07)",
      border: "rgba(26,171,240,0.15)",
    },
    {
      icon: Map,
      title: t("module_infrastructure_title"),
      desc: t("module_infrastructure_desc"),
      accent: "#10b981",
      bg: "rgba(16,185,129,0.07)",
      border: "rgba(16,185,129,0.15)",
    },
    {
      icon: DollarSign,
      title: t("module_finance_title"),
      desc: t("module_finance_desc"),
      accent: "#8b5cf6",
      bg: "rgba(139,92,246,0.07)",
      border: "rgba(139,92,246,0.15)",
    },
    {
      icon: Wrench,
      title: t("module_services_title"),
      desc: t("module_services_desc"),
      accent: "#ef4444",
      bg: "rgba(239,68,68,0.07)",
      border: "rgba(239,68,68,0.15)",
    },
    {
      icon: TrendingUp,
      title: t("module_sales_title"),
      desc: t("module_sales_desc"),
      accent: "#06b6d4",
      bg: "rgba(6,182,212,0.07)",
      border: "rgba(6,182,212,0.15)",
    },
    {
      icon: ShoppingCart,
      title: t("module_inventory_title"),
      desc: t("module_inventory_desc"),
      accent: "#f59e0b",
      bg: "rgba(245,158,11,0.07)",
      border: "rgba(245,158,11,0.15)",
    },
    {
      icon: BarChart3,
      title: t("module_reports_title"),
      desc: t("module_reports_desc"),
      accent: "#ec4899",
      bg: "rgba(236,72,153,0.07)",
      border: "rgba(236,72,153,0.15)",
    },
    {
      icon: Radio,
      title: t("module_playbooks_title"),
      desc: t("module_playbooks_desc"),
      accent: "#14b8a6",
      bg: "rgba(20,184,166,0.07)",
      border: "rgba(20,184,166,0.15)",
    },
  ];

  const VALUES = [
    {
      icon: Zap,
      title: t("value_automation_title"),
      desc: t("value_automation_desc"),
    },
    {
      icon: Shield,
      title: t("value_single_source_title"),
      desc: t("value_single_source_desc"),
    },
    {
      icon: Globe,
      title: t("value_predictable_scale_title"),
      desc: t("value_predictable_scale_desc"),
    },
    {
      icon: Headphones,
      title: t("value_resolutive_support_title"),
      desc: t("value_resolutive_support_desc"),
    },
  ];

  // ── Inline strings not yet in translation file ────────────────────────────
  const s = <T extends Record<Lang, string>>(map: T) => map[lang];

  const HERO_BADGE = s({
    en: "ISP Management Platform",
    pt: "Plataforma de gestão para ISPs",
    fr: "Plateforme de gestion pour FAI",
  });
  const SEE_MODULES = s({
    en: "See modules",
    pt: "Ver módulos",
    fr: "Voir les modules",
  });
  const NAV_LOGIN = s({ en: "Login", pt: "Entrar", fr: "Connexion" });
  const NAV_DEMO = s({
    en: "Request demo",
    pt: "Solicitar demo",
    fr: "Demander une démo",
  });

  const TRUST_BADGES = {
    en: [
      "Self-hosted",
      "Multi-operator",
      "GPON / Wireless",
      "Regulatory compliance",
      "WhatsApp integrations",
    ],
    pt: [
      "Self-hosted",
      "Multi-operadora",
      "GPON / Wireless",
      "Conformidade regulatória",
      "Integrações WhatsApp",
    ],
    fr: [
      "Self-hosted",
      "Multi-opérateur",
      "GPON / Sans fil",
      "Conformité réglementaire",
      "Intégrations WhatsApp",
    ],
  }[lang];

  const METRICS_LABEL = s({
    en: "Real results",
    pt: "Resultados reais",
    fr: "Résultats réels",
  });
  const METRICS_TITLE = s({
    en: "Numbers your operation will feel",
    pt: "Números que a sua operação vai sentir",
    fr: "Des chiffres que votre opération ressentira",
  });
  const METRICS = [
    {
      stat: "99",
      label: s({
        en: "KPIs tracked in real time",
        pt: "KPIs acompanhados em tempo real",
        fr: "KPIs suivis en temps réel",
      }),
    },
    {
      stat: "45%",
      label: s({
        en: "less rework backbone-to-billing",
        pt: "menos retrabalho backbone-to-billing",
        fr: "moins de retravail backbone-to-billing",
      }),
    },
  ];

  const CTA_TITLE = s({
    en: "Ready to turbocharge your operation?",
    pt: "Pronto para turbinar sua operação?",
    fr: "Prêt à turbocharger votre opération ?",
  });
  const CTA_DESC = s({
    en: "Talk to a TurboISP specialist and see how the platform fits your reality.",
    pt: "Fale com um especialista TurboISP e veja como a plataforma se encaixa na sua realidade.",
    fr: "Parlez à un spécialiste TurboISP et découvrez comment la plateforme s'adapte à votre réalité.",
  });
  const CTA_BTN = s({
    en: "Request demo",
    pt: "Solicitar demo",
    fr: "Demander une démo",
  });
  const FOOTER_COPY = s({
    en: "All rights reserved.",
    pt: "Todos os direitos reservados.",
    fr: "Tous droits réservés.",
  });
  const FOOTER_DEMO = s({ en: "Demo", pt: "Demo", fr: "Démo" });
  const FOOTER_ADMIN = s({ en: "Admin", pt: "Admin", fr: "Admin" });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="h-screen overflow-y-auto overflow-x-hidden"
      style={{ backgroundColor: "#e5e5e5" }}
    >
      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 border-b"
        style={{
          backgroundColor: "rgba(229,229,229,0.92)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(0,0,0,0.08)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Image
            src={logo}
            alt="TurboISP"
            height={56}
            className="h-12 w-auto"
            priority
          />

          {/* Nav links */}
          <nav
            className="hidden md:flex items-center gap-6 text-xs"
            style={{ color: "rgba(10,20,40,0.5)" }}
          >
            <a href="#modules" className="hover:text-[#0a1428] transition">
              {t("navbar_modules")}
            </a>
            <a href="#valores" className="hover:text-[#0a1428] transition">
              {t("navbar_why_turboware")}
            </a>
            <a href="#metricas" className="hover:text-[#0a1428] transition">
              {t("navbar_results")}
            </a>
            <Link
              href="/turboisp/pricing"
              className="hover:text-[#0a1428] transition"
            >
              {s({ en: "Pricing", pt: "Preços", fr: "Tarifs" })}
            </Link>
          </nav>

          {/* Right side: lang switcher + CTA */}
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div
              className="hidden md:flex items-center rounded-lg overflow-hidden border"
              style={{ borderColor: "rgba(0,0,0,0.1)" }}
            >
              {LANGS.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className="px-2.5 py-1 text-[10px] font-bold transition"
                  style={{
                    color: lang === code ? "#ffffff" : "rgba(10,20,40,0.4)",
                    backgroundColor: lang === code ? "#1AABF0" : "transparent",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <Link
              href="/admin/login"
              className="text-xs px-3 py-1.5 transition"
              style={{ color: "rgba(10,20,40,0.45)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0a1428")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(10,20,40,0.45)")
              }
            >
              {NAV_LOGIN}
            </Link>
            <Link
              href="/turboisp/register"
              className="text-xs font-semibold px-4 py-1.5 rounded-md transition hover:opacity-90 shadow-sm"
              style={{ backgroundColor: "#1AABF0", color: "#ffffff" }}
            >
              {NAV_DEMO}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-8 border"
          style={{
            backgroundColor: "rgba(26,171,240,0.1)",
            borderColor: "rgba(26,171,240,0.25)",
            color: "#0984c8",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#1AABF0] animate-pulse" />
          {HERO_BADGE}
        </div>

        <h1
          className="text-5xl md:text-6xl font-black tracking-tight leading-[1.08] mb-6"
          style={{ color: "#0a1428" }}
        >
          {t("hero_title")}
        </h1>

        <p
          className="text-base max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: "rgba(10,20,40,0.5)" }}
        >
          {t("hero_subtitle")}
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/turboisp/register"
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition hover:opacity-90 shadow-sm"
            style={{ backgroundColor: "#1AABF0", color: "#ffffff" }}
          >
            {t("hero_cta")} <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#modules"
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium border transition hover:bg-black/5"
            style={{
              borderColor: "rgba(0,0,0,0.12)",
              color: "rgba(10,20,40,0.6)",
            }}
          >
            {SEE_MODULES} <BookOpen className="w-4 h-4" />
          </a>
        </div>

        {/* Trust badges */}
        <div
          className="mt-14 flex items-center justify-center gap-6 flex-wrap text-[10px] uppercase tracking-widest"
          style={{ color: "rgba(10,20,40,0.3)" }}
        >
          {TRUST_BADGES.map((badge) => (
            <span key={badge} className="flex items-center gap-1.5">
              <CheckCircle
                className="w-3 h-3"
                style={{ color: "rgba(26,171,240,0.65)" }}
              />
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-16">
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border shadow-sm"
          style={{
            backgroundColor: "rgba(0,0,0,0.07)",
            borderColor: "rgba(0,0,0,0.07)",
          }}
        >
          {STATS.map(({ value, label }) => (
            <div
              key={value}
              className="py-7 px-6 text-center"
              style={{ backgroundColor: "#fff" }}
            >
              <p
                className="text-3xl font-black mb-1"
                style={{ color: "#1AABF0" }}
              >
                {value}
              </p>
              <p
                className="text-[11px]"
                style={{ color: "rgba(10,20,40,0.45)" }}
              >
                {label[lang]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Modules ────────────────────────────────────────────────────────── */}
      <section
        id="modules"
        className="relative z-10 max-w-6xl mx-auto px-6 py-20"
      >
        <div className="text-center mb-12">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#0984c8" }}
          >
            {t("modules_title")}
          </p>
          <h2 className="text-3xl font-bold" style={{ color: "#0a1428" }}>
            {t("modules_subtitle")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map(({ icon: Icon, title, desc, accent, bg, border }) => (
            <div
              key={title}
              className="p-5 rounded-xl border"
              style={{
                backgroundColor: "#fff",
                borderColor: "rgba(0,0,0,0.07)",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg border flex items-center justify-center mb-4"
                style={{ backgroundColor: bg, borderColor: border }}
              >
                <Icon className="w-4 h-4" style={{ color: accent }} />
              </div>
              <h3
                className="text-sm font-semibold mb-1.5"
                style={{ color: "#0a1428" }}
              >
                {title}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "rgba(10,20,40,0.45)" }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Value props ─────────────────────────────────────────────────────── */}
      <section
        id="valores"
        className="relative z-10 max-w-6xl mx-auto px-6 py-20"
      >
        <div className="text-center mb-12">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#0984c8" }}
          >
            {t("values_title")}
          </p>
          <h2 className="text-3xl font-bold" style={{ color: "#0a1428" }}>
            {t("values_subtitle")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-4 p-6 rounded-xl border"
              style={{
                backgroundColor: "#fff",
                borderColor: "rgba(0,0,0,0.07)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: "rgba(26,171,240,0.08)",
                  borderColor: "rgba(26,171,240,0.2)",
                }}
              >
                <Icon className="w-5 h-5" style={{ color: "#1AABF0" }} />
              </div>
              <div>
                <h3
                  className="text-sm font-semibold mb-1.5"
                  style={{ color: "#0a1428" }}
                >
                  {title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "rgba(10,20,40,0.45)" }}
                >
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Metrics ─────────────────────────────────────────────────────────── */}
      <section
        id="metricas"
        className="relative z-10 max-w-6xl mx-auto px-6 py-20"
      >
        <div className="text-center mb-12">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#0984c8" }}
          >
            {METRICS_LABEL}
          </p>
          <h2 className="text-3xl font-bold" style={{ color: "#0a1428" }}>
            {METRICS_TITLE}
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {METRICS.map(({ stat, label }) => (
            <div
              key={stat}
              className="w-64 p-6 rounded-xl border text-center"
              style={{
                backgroundColor: "#fff",
                borderColor: "rgba(0,0,0,0.07)",
              }}
            >
              <p
                className="text-4xl font-black mb-2"
                style={{ color: "#0a1428" }}
              >
                {stat}
              </p>
              <p
                className="text-[11px] leading-snug"
                style={{ color: "rgba(10,20,40,0.45)" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            background: "linear-gradient(135deg, #0a1428 0%, #14213d 100%)",
          }}
        >
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5"
            style={{
              backgroundColor: "rgba(26,171,240,0.15)",
              border: "1px solid rgba(26,171,240,0.25)",
            }}
          >
            <Zap className="w-6 h-6" style={{ color: "#1AABF0" }} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">{CTA_TITLE}</h2>
          <p
            className="text-sm mb-8 max-w-md mx-auto"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            {CTA_DESC}
          </p>
          <Link
            href="/turboisp/register"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold transition hover:opacity-90 shadow-md"
            style={{ backgroundColor: "#1AABF0", color: "#ffffff" }}
          >
            {CTA_BTN} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer
        className="relative z-10 mt-8 py-10 border-t"
        style={{
          backgroundColor: "#0a1428",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          {/* Logo — inverted for dark background */}
          <Image
            src={logo}
            alt="TurboISP"
            height={56}
            className="h-12 w-auto brightness-0 invert opacity-60"
          />

          {/* Links */}
          <div className="flex items-center gap-6 text-[11px]">
            <a href="#modules" className="hover:text-white/60 transition">
              {t("navbar_modules")}
            </a>
            <a href="#valores" className="hover:text-white/60 transition">
              {t("navbar_why_turboware")}
            </a>
            <a href="#metricas" className="hover:text-white/60 transition">
              {t("navbar_results")}
            </a>
            <Link
              href="/turboisp/pricing"
              className="hover:text-white/60 transition"
            >
              {s({ en: "Pricing", pt: "Preços", fr: "Tarifs" })}
            </Link>
            <Link
              href="/turboisp/register"
              className="hover:text-white/60 transition"
            >
              {FOOTER_DEMO}
            </Link>
            <Link
              href="/admin/login"
              className="hover:text-white/60 transition"
            >
              {FOOTER_ADMIN}
            </Link>
          </div>

          <p className="text-[10px]">
            © {new Date().getFullYear()} TurboISP. {FOOTER_COPY}
          </p>
        </div>
      </footer>
    </div>
  );
}
