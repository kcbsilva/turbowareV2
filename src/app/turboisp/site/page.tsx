"use client";

import { useState } from "react";
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
  TrendingUp,
  Radio,
  Map,
  Headphones,
} from "lucide-react";
import { TurboispPageTranslations as tr } from "./translation";
import { SiteNavbar, SiteFooter } from "./_components/SiteChrome";
import { SiteHero } from "./_components/SiteHero";
import { SiteStatsBar, SiteModulesGrid, SiteValuesSection, SiteMetricsSection } from "./_components/SiteSections";
import { SiteCtaBanner } from "./_components/SiteCta";
import { SiteBackdrop } from "./_components/SiteBackdrop";
import { type Lang, pick } from "./_components/constants";

const STATS = [
  {
    value: { en: "All-in-One", pt: "Tudo em Um", fr: "Tout-en-un" },
    label: { en: "CRM, NOC & GIS", pt: "CRM, NOC e GIS", fr: "CRM, NOC et SIG" },
  },
  {
    value: { en: "Multi-Tenant", pt: "Multi-tenant", fr: "Multi-locataire" },
    label: { en: "ISP Architecture", pt: "Arquitetura multi-tenant", fr: "Architecture multi-locataire" },
  },
  {
    value: { en: "99.9%", pt: "99.9%", fr: "99.9%" },
    label: { en: "Uptime SLA", pt: "Uptime SLA", fr: "SLA de disponibilité" },
  },
  {
    value: { en: "45%", pt: "45%", fr: "45%" },
    label: { en: "Less rework", pt: "Menos retrabalho", fr: "Moins de retravail" },
  },
];

export default function TurboISPSitePage() {
  const [lang, setLang] = useState<Lang>("pt");
  const t = (key: keyof typeof tr) => tr[key][lang];
  const s = <T extends Record<Lang, string>>(map: T) => pick(map, lang);

  const MODULES = [
    { icon: Users, title: t("module_subscribers_title"), desc: t("module_subscribers_desc"), accent: "#fca311" },
    { icon: Network, title: t("module_noc_title"), desc: t("module_noc_desc"), accent: "#1AABF0" },
    { icon: Map, title: t("module_infrastructure_title"), desc: t("module_infrastructure_desc"), accent: "#10b981" },
    { icon: DollarSign, title: t("module_finance_title"), desc: t("module_finance_desc"), accent: "#8b5cf6" },
    { icon: Wrench, title: t("module_services_title"), desc: t("module_services_desc"), accent: "#ef4444" },
    { icon: TrendingUp, title: t("module_sales_title"), desc: t("module_sales_desc"), accent: "#06b6d4" },
    { icon: ShoppingCart, title: t("module_inventory_title"), desc: t("module_inventory_desc"), accent: "#f59e0b" },
    { icon: BarChart3, title: t("module_reports_title"), desc: t("module_reports_desc"), accent: "#ec4899" },
    { icon: Radio, title: t("module_playbooks_title"), desc: t("module_playbooks_desc"), accent: "#14b8a6" },
  ];

  const VALUES = [
    { icon: Zap, title: t("value_automation_title"), desc: t("value_automation_desc") },
    { icon: Shield, title: t("value_single_source_title"), desc: t("value_single_source_desc") },
    { icon: Globe, title: t("value_predictable_scale_title"), desc: t("value_predictable_scale_desc") },
    { icon: Headphones, title: t("value_resolutive_support_title"), desc: t("value_resolutive_support_desc") },
  ];

  const TRUST_BADGES = {
    en: ["Self-hosted", "Multi-operator", "GPON / Wireless", "Regulatory compliance", "WhatsApp integrations"],
    pt: ["Self-hosted", "Multi-operadora", "GPON / Wireless", "Conformidade regulatória", "Integrações WhatsApp"],
    fr: ["Self-hosted", "Multi-opérateur", "GPON / Sans fil", "Conformité réglementaire", "Intégrations WhatsApp"],
  }[lang];

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

  return (
    <div className="relative min-h-screen">
      <SiteBackdrop />

      <SiteNavbar
        lang={lang}
        onLangChange={setLang}
        labels={{
          modules: t("navbar_modules"),
          why: t("navbar_why_turboware"),
          results: t("navbar_results"),
          pricing: s({ en: "Pricing", pt: "Preços", fr: "Tarifs" }),
          login: s({ en: "Login", pt: "Entrar", fr: "Connexion" }),
          demo: s({ en: "Start free trial", pt: "Comece grátis", fr: "Essai gratuit" }),
        }}
      />

      <SiteHero
        badge={s({
          en: "ISP Management Platform",
          pt: "Plataforma de gestão para ISPs",
          fr: "Plateforme de gestion pour FAI",
        })}
        tagline={s({
          en: "Full throttle ops",
          pt: "Operação em alta rotação",
          fr: "Opérations à plein régime",
        })}
        title={t("hero_title")}
        subtitle={t("hero_subtitle")}
        cta={t("hero_cta")}
        seeModules={s({ en: "See modules", pt: "Ver módulos", fr: "Voir les modules" })}
        trustBadges={TRUST_BADGES}
      />

      <SiteStatsBar
        stats={STATS.map(({ value, label }) => ({ value: value[lang], label: label[lang] }))}
      />

      <SiteModulesGrid eyebrow={t("modules_title")} title={t("modules_subtitle")} modules={MODULES} />

      <SiteValuesSection eyebrow={t("values_title")} title={t("values_subtitle")} values={VALUES} />

      <SiteMetricsSection
        eyebrow={s({ en: "Real results", pt: "Resultados reais", fr: "Résultats réels" })}
        title={s({
          en: "Numbers your operation will feel",
          pt: "Números que a sua operação vai sentir",
          fr: "Des chiffres que votre opération ressentira",
        })}
        metrics={METRICS}
      />

      <SiteCtaBanner
        title={s({
          en: "Ready to turbocharge your operation?",
          pt: "Pronto para turbinar sua operação?",
          fr: "Prêt à turbocharger votre opération ?",
        })}
        description={s({
          en: "Start your 14-day trial — provisioning takes minutes on turboisp.app.",
          pt: "Comece seu trial de 14 dias — provisionamento em minutos no turboisp.app.",
          fr: "Commencez votre essai de 14 jours — provisionnement en minutes sur turboisp.app.",
        })}
        cta={s({ en: "Start free trial", pt: "Comece grátis", fr: "Essai gratuit" })}
      />

      <SiteFooter
        labels={{
          modules: t("navbar_modules"),
          why: t("navbar_why_turboware"),
          results: t("navbar_results"),
          pricing: s({ en: "Pricing", pt: "Preços", fr: "Tarifs" }),
          demo: s({ en: "Demo", pt: "Demo", fr: "Démo" }),
          admin: s({ en: "Admin", pt: "Admin", fr: "Admin" }),
          copy: s({ en: "All rights reserved.", pt: "Todos os direitos reservados.", fr: "Tous droits réservés." }),
        }}
      />
    </div>
  );
}
