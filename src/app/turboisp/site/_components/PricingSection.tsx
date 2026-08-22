"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Cloud, Info, Mail, Server } from "lucide-react";
import {
  PRICING_TIERS,
  INSTALLATION_FEES,
  SELF_HOSTED_SPECS,
  formatDisk,
  formatPrice,
  type PricingTier,
  type Region,
} from "@/lib/pricing";
import { type Lang, pick } from "./constants";

type Hosting = "cloud" | "self-hosted";

type RegionConfig = {
  code: Region;
  flag: string;
  label: Record<Lang, string>;
};

const REGIONS: RegionConfig[] = [
  { code: "BR", flag: "🇧🇷", label: { en: "BR", pt: "BR", fr: "BR" } },
  { code: "CA", flag: "🇨🇦", label: { en: "CA", pt: "CA", fr: "CA" } },
  { code: "US", flag: "🇺🇸", label: { en: "US", pt: "US", fr: "US" } },
  { code: "GB", flag: "🇬🇧", label: { en: "GB", pt: "GB", fr: "GB" } },
];

function planName(tier: PricingTier): string {
  return tier.maxSeats == null ? "12,000+" : tier.maxSeats.toLocaleString("en-US");
}

export function PricingSection({ lang }: { lang: Lang }) {
  const [region, setRegion] = useState<Region>("BR");
  const [hosting, setHosting] = useState<Hosting>("cloud");
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const s = <T extends Record<Lang, string>>(map: T) => pick(map, lang);
  const installFee = INSTALLATION_FEES[region];
  const isCloud = hosting === "cloud";

  useEffect(() => {
    scrollerRef.current?.scrollTo({ left: 0 });
    setOpenInfo(null);
  }, [hosting, region]);

  useEffect(() => {
    if (!openInfo) return;
    const close = () => setOpenInfo(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openInfo]);

  const scrollByCard = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  return (
    <section id="pricing" className="relative px-6 lg:px-12 py-16 bg-white scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 max-w-md mx-auto">
          <span className="text-sky-600 text-sm font-mono uppercase tracking-wider">
            {s({ en: "Pricing", pt: "Planos", fr: "Tarifs" })}
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold mt-3 text-slate-900">
            {s({
              en: "Plans that grow with you",
              pt: "Planos que crescem com você",
              fr: "Des forfaits évolutifs",
            })}
          </h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            {isCloud
              ? s({
                  en: "We host TurboISP. One monthly fee by subscriber count.",
                  pt: "Nós hospedamos o TurboISP. Uma mensalidade por assinantes.",
                  fr: "Nous hébergeons TurboISP. Un forfait mensuel selon les abonnés.",
                })
              : s({
                  en: "You run TurboISP on your own servers. Same plans, you own the stack.",
                  pt: "Você roda o TurboISP nos seus servidores. Mesmos planos, a stack é sua.",
                  fr: "Vous hébergez TurboISP. Mêmes forfaits, vous possédez la stack.",
                })}
          </p>
        </div>

        <div className="flex items-stretch gap-2 max-w-xl mx-auto mb-6">
          <div
            role="tablist"
            aria-label={s({ en: "Hosting", pt: "Hospedagem", fr: "Hébergement" })}
            className="flex flex-1 p-1 rounded-lg bg-slate-100 border border-slate-200"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isCloud}
              onClick={() => setHosting("cloud")}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-semibold transition ${
                isCloud ? "bg-white text-sky-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              {s({ en: "Cloud", pt: "Cloud", fr: "Cloud" })}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isCloud}
              onClick={() => setHosting("self-hosted")}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-semibold transition ${
                !isCloud ? "bg-white text-sky-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              {s({ en: "Self-hosted", pt: "Self-hosted", fr: "Auto-hébergé" })}
            </button>
          </div>

          <label className="sr-only" htmlFor="pricing-region">
            {s({ en: "Region", pt: "Região", fr: "Région" })}
          </label>
          <select
            id="pricing-region"
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-700 cursor-pointer hover:border-sky-300 focus:outline-none focus:border-sky-500"
          >
            {REGIONS.map(({ code, label, flag }) => (
              <option key={code} value={code}>
                {flag} {label[lang]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label={s({ en: "Previous plans", pt: "Planos anteriores", fr: "Forfaits précédents" })}
            className="shrink-0 p-2 rounded-full border border-slate-300 text-slate-600 hover:border-sky-500 hover:text-sky-600 transition bg-white"
          >
            <ChevronLeft size={18} />
          </button>

          <div
            ref={scrollerRef}
            className="flex flex-1 gap-3 overflow-x-auto snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {PRICING_TIERS.map((tier) => {
              const price = tier.prices[region];
              const isInquire = price === "inquire";
              const infoOpen = openInfo === tier.label;
              const spec = SELF_HOSTED_SPECS[tier.label];
              return (
                <article
                  key={tier.label}
                  data-plan-card
                  className="relative shrink-0 snap-start w-full sm:w-[calc((100%-0.75rem)/2)] lg:w-[calc((100%-2.25rem)/4)] rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {s({ en: "Up to", pt: "Até", fr: "Jusqu'à" })}
                      </p>
                      <p className="text-lg font-bold text-slate-900 leading-tight">{planName(tier)}</p>
                      <p className="text-[11px] text-slate-500">
                        {s({ en: "subscribers", pt: "assinantes", fr: "abonnés" })}
                      </p>
                    </div>
                    {!isCloud && (
                      <button
                        type="button"
                        aria-expanded={infoOpen}
                        aria-label={s({
                          en: `About the ${planName(tier)} self-hosted plan`,
                          pt: `Sobre o plano self-hosted ${planName(tier)}`,
                          fr: `À propos du forfait auto-hébergé ${planName(tier)}`,
                        })}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenInfo(infoOpen ? null : tier.label);
                        }}
                        className={`mt-0.5 p-1 rounded-full border transition shrink-0 ${
                          infoOpen
                            ? "border-sky-500 text-sky-600 bg-sky-50"
                            : "border-slate-200 text-slate-400 hover:border-sky-300 hover:text-sky-600"
                        }`}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {!isCloud && infoOpen && (
                    <div
                      role="tooltip"
                      className="absolute inset-x-3 top-12 z-20 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-[11px] font-semibold text-slate-900 mb-1.5">
                        {s({
                          en: "Minimum recommended server",
                          pt: "Servidor mínimo recomendado",
                          fr: "Serveur minimum recommandé",
                        })}
                      </p>
                      {spec ? (
                        <ul className="text-[11px] text-slate-600 space-y-1 leading-snug tabular-nums">
                          <li>{spec.vcpu} vCPUs</li>
                          <li>{spec.ramGb} GB RAM</li>
                          <li>
                            {formatDisk(spec.diskGb)}{" "}
                            {s({ en: "disk", pt: "disco", fr: "disque" })}
                          </li>
                        </ul>
                      ) : (
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {s({
                            en: "We'll size CPU, RAM, and disk with you.",
                            pt: "Dimensionamos CPU, RAM e disco com você.",
                            fr: "Nous dimensionnons CPU, RAM et disque avec vous.",
                          })}
                        </p>
                      )}
                    </div>
                  )}

                  {tier.maxMapItems != null && (
                    <p className="text-[11px] text-slate-500 mb-4">
                      {tier.maxMapItems.toLocaleString("en-US")}{" "}
                      {s({ en: "map items", pt: "itens no mapa", fr: "éléments carte" })}
                    </p>
                  )}
                  {tier.maxMapItems == null && (
                    <p className="text-[11px] text-slate-500 mb-4">
                      {s({ en: "Custom map capacity", pt: "Mapa customizado", fr: "Carte sur mesure" })}
                    </p>
                  )}

                  {isInquire ? (
                    <a
                      href="mailto:sales@turboisp.com"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 hover:text-sky-700"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {s({ en: "Contact us", pt: "Fale conosco", fr: "Nous contacter" })}
                    </a>
                  ) : (
                    <div>
                      <p className="text-xl font-black tabular-nums text-slate-900">
                        {formatPrice(price, region)}
                        <span className="text-[11px] font-medium text-slate-400">
                          {s({ en: "/mo", pt: "/mês", fr: "/mois" })}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {s({ en: "Setup", pt: "Setup", fr: "Setup" })} {formatPrice(installFee, region)}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label={s({ en: "Next plans", pt: "Próximos planos", fr: "Forfaits suivants" })}
            className="shrink-0 p-2 rounded-full border border-slate-300 text-slate-600 hover:border-sky-500 hover:text-sky-600 transition bg-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <p className="text-[11px] text-slate-500 text-center mt-5 leading-relaxed max-w-md mx-auto">
          {isCloud
            ? s({
                en: "Includes hosting, updates, and backups. Setup covers DNS and onboarding.",
                pt: "Inclui hospedagem, updates e backups. O setup cobre DNS e onboarding.",
                fr: "Hébergement, mises à jour et sauvegardes inclus. Le setup couvre DNS et onboarding.",
              })
            : s({
                en: "You provide the server. Setup covers on-prem install and onboarding.",
                pt: "Você fornece o servidor. O setup cobre instalação on-prem e onboarding.",
                fr: "Vous fournissez le serveur. Le setup couvre l'install on-prem et l'onboarding.",
              })}
        </p>
      </div>
    </section>
  );
}
