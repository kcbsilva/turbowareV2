"use client";

import { useState } from "react";
import { Cloud, Mail, Server } from "lucide-react";
import {
  PRICING_TIERS,
  INSTALLATION_FEES,
  formatPrice,
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

export function PricingSection({ lang }: { lang: Lang }) {
  const [region, setRegion] = useState<Region>("BR");
  const [hosting, setHosting] = useState<Hosting>("cloud");
  const s = <T extends Record<Lang, string>>(map: T) => pick(map, lang);
  const installFee = INSTALLATION_FEES[region];
  const isCloud = hosting === "cloud";

  return (
    <section id="pricing" className="relative px-6 lg:px-12 py-16 bg-white scroll-mt-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
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

        <div
          role="tablist"
          aria-label={s({ en: "Hosting", pt: "Hospedagem", fr: "Hébergement" })}
          className="flex p-1 rounded-lg bg-slate-100 border border-slate-200 mb-5"
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

        <div className="flex items-center justify-center gap-1.5 mb-4">
          {REGIONS.map(({ code, label, flag }) => (
            <button
              key={code}
              type="button"
              onClick={() => setRegion(code)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition ${
                region === code
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-sky-300"
              }`}
            >
              <span className="leading-none">{flag}</span>
              {label[lang]}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 text-[10px] font-bold uppercase tracking-widest text-white/50">
                <th className="text-left font-bold px-3 py-2">
                  {s({ en: "Subscribers", pt: "Assinantes", fr: "Abonnés" })}
                </th>
                <th className="text-right font-bold px-3 py-2">
                  {s({ en: "Monthly", pt: "Mensal", fr: "Mensuel" })}
                </th>
              </tr>
            </thead>
            <tbody>
              {PRICING_TIERS.map((tier, i) => {
                const price = tier.prices[region];
                const isInquire = price === "inquire";
                const isLast = i === PRICING_TIERS.length - 1;
                return (
                  <tr
                    key={tier.label}
                    className={`${isLast ? "" : "border-b border-slate-100"} ${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/80"
                    }`}
                  >
                    <td className="px-3 py-1.5 font-medium text-slate-800">
                      {isLast ? "12,000+" : Number(tier.label).toLocaleString("en-US")}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      {isInquire ? (
                        <a
                          href="mailto:sales@turboisp.com"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
                        >
                          <Mail className="w-3 h-3" />
                          {s({ en: "Contact us", pt: "Fale conosco", fr: "Nous contacter" })}
                        </a>
                      ) : (
                        <span className="font-semibold text-slate-900">{formatPrice(price, region)}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t border-slate-200 bg-sky-50/70">
                <td className="px-3 py-2 text-xs text-slate-600">
                  {s({
                    en: "One-time setup",
                    pt: "Setup único",
                    fr: "Setup unique",
                  })}
                </td>
                <td className="px-3 py-2 text-right text-sm font-semibold tabular-nums text-slate-900">
                  {formatPrice(installFee, region)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-slate-500 text-center mt-3 leading-relaxed">
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
