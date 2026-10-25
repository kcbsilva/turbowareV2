"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ChevronDown } from "lucide-react";
import logo from "../assets/TurboISP-logo.png";
import {
  PRICING_TIERS,
  INSTALLATION_FEES,
  CURRENCY_SYMBOL,
  type Region,
} from "@/lib/pricing";
import { LANGS, pick, type Lang } from "../site/_components/constants";
import { useSiteLang } from "../site/_components/site-lang";
import { NUMBER_LOCALE, pricingCopy } from "./copy";
import { turbowareTitle, useDocumentTitle } from "@/lib/document-title";

const REGION_KEYS: { code: Region; flag: string; label: keyof typeof pricingCopy }[] = [
  { code: "BR", flag: "🇧🇷", label: "regionBR" },
  { code: "CA", flag: "🇨🇦", label: "regionCA" },
  { code: "US", flag: "🇺🇸", label: "regionUS" },
  { code: "GB", flag: "🇬🇧", label: "regionGB" },
];

function fill(template: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce((out, [key, value]) => out.replaceAll(`{${key}}`, value), template);
}

export default function PricingPage() {
  const [region, setRegion] = useState<Region>("BR");
  const { lang, setLang } = useSiteLang();
  const s = (key: keyof typeof pricingCopy) => pick(pricingCopy[key], lang);
  useDocumentTitle(turbowareTitle(s("navPricing")));

  const installFee = INSTALLATION_FEES[region];
  const sym = CURRENCY_SYMBOL[region];
  const numberLocale = NUMBER_LOCALE[lang];

  return (
    <div
      className="min-h-screen overflow-x-hidden"
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
          <Link href="/turboisp/site">
            <Image
              src={logo}
              alt="TurboISP"
              height={56}
              className="h-12 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center gap-6">
            <nav
              className="hidden md:flex items-center gap-6 text-xs"
              style={{ color: "rgba(10,20,40,0.5)" }}
            >
              <Link
                href="/turboisp/site#platform"
                className="hover:text-[#0a1428] transition"
              >
                {s("navModules")}
              </Link>
              <Link
                href="/turboisp/site#why"
                className="hover:text-[#0a1428] transition"
              >
                {s("navWhy")}
              </Link>
              <Link
                href="/turboisp/pricing"
                className="font-semibold transition"
                style={{ color: "#0a1428" }}
              >
                {s("navPricing")}
              </Link>
            </nav>
            <label className="relative inline-flex h-8 items-center">
              <span className="sr-only">{s("language")}</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                className="h-8 appearance-none rounded-full border border-slate-800 bg-white pl-3 pr-7 text-xs font-semibold text-black cursor-pointer"
              >
                {LANGS.map(({ code, label }) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-black" />
            </label>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-6 border"
          style={{
            backgroundColor: "rgba(26,171,240,0.1)",
            borderColor: "rgba(26,171,240,0.25)",
            color: "#0984c8",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#1AABF0] animate-pulse" />
          {s("eyebrow")}
        </div>

        <h1
          className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4"
          style={{ color: "#0a1428" }}
        >
          {s("title")}
        </h1>
        <p
          className="text-sm max-w-xl mx-auto leading-relaxed"
          style={{ color: "rgba(10,20,40,0.5)" }}
        >
          {s("lead")}
        </p>
      </section>

      {/* ── Region Switcher ─────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-8">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {REGION_KEYS.map(({ code, label, flag }) => (
            <button
              key={code}
              onClick={() => setRegion(code)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition"
              style={{
                backgroundColor: region === code ? "#0a1428" : "#ffffff",
                color: region === code ? "#ffffff" : "rgba(10,20,40,0.6)",
                borderColor: region === code ? "#0a1428" : "rgba(0,0,0,0.1)",
                boxShadow:
                  region === code ? "0 2px 8px rgba(10,20,40,0.15)" : undefined,
              }}
            >
              <span className="text-base leading-none">{flag}</span>
              {s(label)}
            </button>
          ))}
        </div>
      </section>

      {/* ── Installation Fee Banner ─────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-6">
        <div
          className="flex items-center justify-between gap-4 px-6 py-4 rounded-xl border"
          style={{
            backgroundColor: "rgba(26,171,240,0.06)",
            borderColor: "rgba(26,171,240,0.2)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "rgba(26,171,240,0.12)",
                border: "1px solid rgba(26,171,240,0.25)",
              }}
            >
              <CheckCircle className="w-4 h-4" style={{ color: "#1AABF0" }} />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: "#0a1428" }}>
                {s("installTitle")}
              </p>
              <p
                className="text-[11px]"
                style={{ color: "rgba(10,20,40,0.45)" }}
              >
                {s("installBody")}
              </p>
            </div>
          </div>
          <p
            className="text-2xl font-black shrink-0"
            style={{ color: "#0a1428" }}
          >
            {sym}&nbsp;{installFee.toLocaleString(numberLocale)}
          </p>
        </div>
      </section>

      {/* ── Pricing Table ───────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-16">
        <div
          className="rounded-2xl border overflow-hidden shadow-sm"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "rgba(0,0,0,0.08)",
          }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-2 px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-b"
            style={{
              backgroundColor: "#0a1428",
              borderColor: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <span>{s("subscribers")}</span>
            <span className="text-right">{s("monthly")}</span>
          </div>

          {/* Rows */}
          {PRICING_TIERS.map((tier, i) => {
            const price = tier.prices[region];
            const isInquire = price === "inquire";
            const isLast = i === PRICING_TIERS.length - 1;
            return (
              <div
                key={tier.label}
                className="grid grid-cols-2 px-6 py-4 items-center"
                style={{
                  borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.05)",
                  backgroundColor: i % 2 === 0 ? "#ffffff" : "rgba(0,0,0,0.01)",
                }}
              >
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#0a1428" }}
                  >
                    {isLast
                      ? `${Number(12000).toLocaleString(numberLocale)}+`
                      : fill(s("activeSubscribers"), {
                          n: Number(tier.label).toLocaleString(numberLocale),
                        })}
                  </p>
                </div>
                <div className="text-right">
                  {isInquire ? (
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "rgba(10,20,40,0.45)" }}
                    >
                      {s("onRequest")}
                    </p>
                  ) : (
                    <div>
                      <p
                        className="text-lg font-black"
                        style={{ color: "#0a1428" }}
                      >
                        {`${sym}\u00A0${price.toLocaleString(numberLocale)}`}
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: "rgba(10,20,40,0.35)" }}
                      >
                        {s("perMonth")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer
        className="relative z-10 py-8 border-t"
        style={{
          backgroundColor: "#0a1428",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          <Image
            src={logo}
            alt="TurboISP"
            height={56}
            className="h-10 w-auto brightness-0 invert opacity-60"
          />
          <div className="flex items-center gap-6 text-[11px]">
            <Link
              href="/turboisp/site#platform"
              className="hover:text-white/60 transition"
            >
              {s("navModules")}
            </Link>
            <Link
              href="/turboisp/pricing"
              className="hover:text-white/60 transition"
            >
              {s("navPricing")}
            </Link>
          </div>
          <p className="text-[10px]">
            {new Date().getFullYear()} - TurboISP
          </p>
        </div>
      </footer>
    </div>
  );
}
