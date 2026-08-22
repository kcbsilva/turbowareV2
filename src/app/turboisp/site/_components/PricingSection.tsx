"use client";

import { useState } from "react";
import { CheckCircle, Mail } from "lucide-react";
import {
  PRICING_TIERS,
  INSTALLATION_FEES,
  formatPrice,
  type Region,
} from "@/lib/pricing";
import { type Lang, pick } from "./constants";

type RegionConfig = {
  code: Region;
  flag: string;
  label: Record<Lang, string>;
};

const REGIONS: RegionConfig[] = [
  { code: "BR", flag: "🇧🇷", label: { en: "Brasil", pt: "Brasil", fr: "Brésil" } },
  { code: "CA", flag: "🇨🇦", label: { en: "Canada", pt: "Canadá", fr: "Canada" } },
  { code: "US", flag: "🇺🇸", label: { en: "United States", pt: "Estados Unidos", fr: "États-Unis" } },
  { code: "GB", flag: "🇬🇧", label: { en: "England", pt: "Inglaterra", fr: "Angleterre" } },
];

export function PricingSection({ lang }: { lang: Lang }) {
  const [region, setRegion] = useState<Region>("BR");
  const s = <T extends Record<Lang, string>>(map: T) => pick(map, lang);
  const installFee = INSTALLATION_FEES[region];

  return (
    <section id="pricing" className="relative px-6 lg:px-12 py-24 bg-white scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sky-600 text-sm font-mono uppercase tracking-wider">
            {s({ en: "Pricing", pt: "Planos", fr: "Tarifs" })}
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold mt-4 text-slate-900">
            {s({
              en: "Plans that grow with your operation",
              pt: "Planos que crescem com sua operação",
              fr: "Des forfaits qui grandissent avec vous",
            })}
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto mt-4 leading-relaxed">
            {s({
              en: "One monthly fee based on your subscriber count. No hidden charges, no per-feature tiers.",
              pt: "Uma mensalidade baseada no número de assinantes. Sem taxas escondidas, sem módulos extras.",
              fr: "Un forfait mensuel selon le nombre d'abonnés. Pas de frais cachés, pas de paliers par fonction.",
            })}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          {REGIONS.map(({ code, label, flag }) => (
            <button
              key={code}
              type="button"
              onClick={() => setRegion(code)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                region === code
                  ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-200"
                  : "bg-white text-slate-600 border-slate-200 hover:border-sky-300"
              }`}
            >
              <span className="text-base leading-none">{flag}</span>
              {label[lang]}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 px-6 py-4 rounded-xl border border-sky-200 bg-sky-50 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-sky-100 border border-sky-200">
              <CheckCircle className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {s({
                  en: "One-time Installation Fee",
                  pt: "Taxa de instalação única",
                  fr: "Frais d'installation uniques",
                })}
              </p>
              <p className="text-xs text-slate-500">
                {s({
                  en: "Covers full platform setup, DNS configuration, and onboarding",
                  pt: "Cobre setup completo da plataforma, DNS e onboarding",
                  fr: "Couvre la mise en place, la configuration DNS et l'onboarding",
                })}
              </p>
            </div>
          </div>
          <p className="text-2xl font-black shrink-0 text-slate-900">
            {formatPrice(installFee, region)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
          <div className="grid grid-cols-2 px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-b bg-slate-900 text-white/50">
            <span>{s({ en: "Subscribers", pt: "Assinantes", fr: "Abonnés" })}</span>
            <span className="text-right">{s({ en: "Monthly", pt: "Mensal", fr: "Mensuel" })}</span>
          </div>

          {PRICING_TIERS.map((tier, i) => {
            const price = tier.prices[region];
            const isInquire = price === "inquire";
            const isLast = i === PRICING_TIERS.length - 1;
            return (
              <div
                key={tier.label}
                className={`grid grid-cols-2 px-6 py-4 items-center ${
                  isLast ? "" : "border-b border-slate-100"
                } ${i % 2 === 0 ? "bg-white" : "bg-slate-50/70"}`}
              >
                <p className="text-sm font-semibold text-slate-900">
                  {isLast
                    ? "12,000+"
                    : s({
                        en: `${Number(tier.label).toLocaleString("en-US")} active subscribers`,
                        pt: `${Number(tier.label).toLocaleString("pt-BR")} assinantes ativos`,
                        fr: `${Number(tier.label).toLocaleString("fr-FR")} abonnés actifs`,
                      })}
                </p>
                <div className="text-right">
                  {isInquire ? (
                    <a
                      href="mailto:sales@turboisp.com"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-sky-200 text-sky-600 bg-sky-50 hover:bg-sky-100 transition"
                    >
                      <Mail className="w-3 h-3" />
                      {s({ en: "Contact us", pt: "Fale conosco", fr: "Nous contacter" })}
                    </a>
                  ) : (
                    <div>
                      <p className="text-lg font-black text-slate-900">{formatPrice(price, region)}</p>
                      <p className="text-[10px] text-slate-400">
                        {s({ en: "/ month", pt: "/ mês", fr: "/ mois" })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
