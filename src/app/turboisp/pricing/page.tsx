"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../assets/TurboISP-logo.png";
import {
  PRICING_TIERS,
  INSTALLATION_FEES,
  CURRENCY_SYMBOL,
  type Region,
} from "@/lib/pricing";
import { ArrowRight, CheckCircle, Mail } from "lucide-react";

type RegionConfig = {
  code: Region;
  label: string;
  flag: string;
};

const REGIONS: RegionConfig[] = [
  { code: "BR", label: "Brasil", flag: "🇧🇷" },
  { code: "CA", label: "Canada", flag: "🇨🇦" },
  { code: "US", label: "United States", flag: "🇺🇸" },
  { code: "GB", label: "England", flag: "🇬🇧" },
];

function fmt(amount: number | "inquire", region: Region): string {
  if (amount === "inquire") return "Inquire";
  const sym = CURRENCY_SYMBOL[region];
  return `${sym}\u00A0${amount.toLocaleString("en-US")}`;
}

export default function PricingPage() {
  const [region, setRegion] = useState<Region>("BR");

  const installFee = INSTALLATION_FEES[region];
  const sym = CURRENCY_SYMBOL[region];

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

          <nav
            className="hidden md:flex items-center gap-6 text-xs"
            style={{ color: "rgba(10,20,40,0.5)" }}
          >
            <Link
              href="/turboisp/site#modules"
              className="hover:text-[#0a1428] transition"
            >
              Modules
            </Link>
            <Link
              href="/turboisp/site#valores"
              className="hover:text-[#0a1428] transition"
            >
              Why TurboISP
            </Link>
            <Link
              href="/turboisp/pricing"
              className="font-semibold transition"
              style={{ color: "#0a1428" }}
            >
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="text-xs px-3 py-1.5 transition"
              style={{ color: "rgba(10,20,40,0.45)" }}
            >
              Login
            </Link>
            <Link
              href="/turboisp/register"
              className="text-xs font-semibold px-4 py-1.5 rounded-md transition hover:opacity-90 shadow-sm"
              style={{ backgroundColor: "#1AABF0", color: "#ffffff" }}
            >
              Get Started
            </Link>
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
          Simple, Transparent Pricing
        </div>

        <h1
          className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4"
          style={{ color: "#0a1428" }}
        >
          Plans that grow with your operation
        </h1>
        <p
          className="text-sm max-w-xl mx-auto leading-relaxed"
          style={{ color: "rgba(10,20,40,0.5)" }}
        >
          One monthly fee based on your subscriber count. No hidden charges, no
          per-feature tiers.
        </p>
      </section>

      {/* ── Region Switcher ─────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-8">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {REGIONS.map(({ code, label, flag }) => (
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
              {label}
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
                One-time Installation Fee
              </p>
              <p
                className="text-[11px]"
                style={{ color: "rgba(10,20,40,0.45)" }}
              >
                Covers full platform setup, DNS configuration, and onboarding
              </p>
            </div>
          </div>
          <p
            className="text-2xl font-black shrink-0"
            style={{ color: "#0a1428" }}
          >
            {sym}&nbsp;{installFee.toLocaleString("en-US")}
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
            <span>Subscribers</span>
            <span className="text-right">Monthly</span>
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
                      ? "12,000+"
                      : `${Number(tier.label).toLocaleString("en-US")} active subscribers`}
                  </p>
                </div>
                <div className="text-right">
                  {isInquire ? (
                    <a
                      href="mailto:sales@turboisp.com"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border transition hover:opacity-80"
                      style={{
                        color: "#1AABF0",
                        borderColor: "rgba(26,171,240,0.3)",
                        backgroundColor: "rgba(26,171,240,0.05)",
                      }}
                    >
                      <Mail className="w-3 h-3" />
                      Contact us
                    </a>
                  ) : (
                    <div>
                      <p
                        className="text-lg font-black"
                        style={{ color: "#0a1428" }}
                      >
                        {fmt(price, region)}
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: "rgba(10,20,40,0.35)" }}
                      >
                        / month
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-16">
        <div
          className="rounded-2xl p-10 text-center"
          style={{
            background: "linear-gradient(135deg, #0a1428 0%, #14213d 100%)",
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Ready to get started?
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Register your ISP and get 14 days free — no credit card required.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/turboisp/register"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition hover:opacity-90"
              style={{ backgroundColor: "#1AABF0", color: "#ffffff" }}
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
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
              href="/turboisp/site#modules"
              className="hover:text-white/60 transition"
            >
              Modules
            </Link>
            <Link
              href="/turboisp/pricing"
              className="hover:text-white/60 transition"
            >
              Pricing
            </Link>
            <Link
              href="/turboisp/register"
              className="hover:text-white/60 transition"
            >
              Register
            </Link>
            <Link
              href="/admin/login"
              className="hover:text-white/60 transition"
            >
              Admin
            </Link>
          </div>
          <p className="text-[10px]">
            © {new Date().getFullYear()} TurboISP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
