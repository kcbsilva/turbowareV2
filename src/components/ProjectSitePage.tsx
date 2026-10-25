"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle, Zap } from "lucide-react";

import turbowareLogo from "@/app/assets/turboware-logo.png";
import { pick, type Lang } from "@/app/turboisp/site/_components/constants";
import { useSiteLang } from "@/app/turboisp/site/_components/site-lang";
import { SiteLangSelect } from "@/components/SiteLangSelect";
import { turbowareTitle, useDocumentTitle, useMetaDescription } from "@/lib/document-title";
import { textOf } from "@/lib/locale-copy";
import { productChrome } from "@/lib/portfolio-copy";
import { PRODUCT_SITES } from "@/lib/project-site-content";

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const numeric = Number.parseInt(value, 16);
  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function fill(template: string, name: string) {
  return template.replaceAll("{name}", name);
}

type Props = {
  slug: string;
};

export function ProjectSitePage({ slug }: Props) {
  const product = PRODUCT_SITES[slug];
  const { lang, setLang } = useSiteLang();
  const copy = (value: Parameters<typeof pick>[0]) => pick(value, lang as Lang);

  useDocumentTitle(turbowareTitle(product?.name ?? "Turboware"));
  useMetaDescription(product ? copy(product.heroSubtitle) : "");

  if (!product) return null;

  const accent = product.accent;
  const accentSoft = hexToRgba(accent, 0.12);
  const accentBorder = hexToRgba(accent, 0.24);
  const accentStrong = hexToRgba(accent, 0.18);
  const primaryLabel = product.comingSoon ? copy(productChrome.comingSoon) : copy(productChrome.explore);

  return (
    <div
      className="h-screen overflow-y-auto overflow-x-hidden"
      style={{ backgroundColor: "#e5e5e5" }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <header
        className="sticky top-0 z-20 border-b"
        style={{
          backgroundColor: "rgba(229,229,229,0.92)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(0,0,0,0.08)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-4">
            <Image
              src={turbowareLogo}
              alt="Turboware"
              height={52}
              className="h-11 w-auto"
              priority
            />
            <div className="hidden sm:block">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: "rgba(10,20,40,0.38)" }}
              >
                {copy(product.categoryLabel)}
              </p>
              <p className="text-sm font-semibold" style={{ color: "#0a1428" }}>
                {product.name}
              </p>
            </div>
          </div>

          <nav
            className="hidden items-center gap-6 text-xs md:flex"
            style={{ color: "rgba(10,20,40,0.52)" }}
          >
            <a href="#platform" className="transition hover:text-[#0a1428]">
              {copy(productChrome.platform)}
            </a>
            <a href="#advantages" className="transition hover:text-[#0a1428]">
              {copy(productChrome.why)}
            </a>
            <a href="#impact" className="transition hover:text-[#0a1428]">
              {copy(productChrome.impact)}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/site"
              className="hidden text-xs transition sm:inline"
              style={{ color: "rgba(10,20,40,0.45)" }}
            >
              {copy(productChrome.allProducts)}
            </Link>
            <SiteLangSelect lang={lang} setLang={setLang} label={copy(productChrome.language)} />
            {product.comingSoon ? (
              <span
                className="rounded-md px-4 py-2 text-xs font-semibold"
                style={{
                  backgroundColor: accentSoft,
                  border: `1px solid ${accentBorder}`,
                  color: accent,
                }}
              >
                {copy(productChrome.comingSoon)}
              </span>
            ) : (
              <Link
                href="/admin/login"
                className="rounded-md px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                {copy(productChrome.access)}
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-20 pt-24 text-center">
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
          style={{
            backgroundColor: accentSoft,
            borderColor: accentBorder,
            color: accent,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: accent }}
          />
          {copy(product.badge)}
        </div>

        <h1
          className="mb-6 text-5xl font-black leading-[1.08] tracking-tight md:text-6xl"
          style={{ color: "#0a1428" }}
        >
          {copy(product.heroTitle)}
        </h1>

        <p
          className="mx-auto mb-10 max-w-3xl text-base leading-relaxed"
          style={{ color: "rgba(10,20,40,0.55)" }}
        >
          {copy(product.heroSubtitle)}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#platform"
            className="flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            {primaryLabel} <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            href="/site"
            className="flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium transition hover:bg-black/5"
            style={{ borderColor: "rgba(0,0,0,0.12)", color: "rgba(10,20,40,0.6)" }}
          >
            {copy(productChrome.back)} <BookOpen className="h-4 w-4" />
          </Link>
        </div>

        <div
          className="mt-14 flex flex-wrap items-center justify-center gap-6 text-[10px] uppercase tracking-widest"
          style={{ color: "rgba(10,20,40,0.34)" }}
        >
          {product.trustBadges.map((badge, index) => (
            <span key={index} className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3" style={{ color: accent }} />
              {copy(badge)}
            </span>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16">
        <div
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border shadow-sm md:grid-cols-4"
          style={{ backgroundColor: "rgba(0,0,0,0.07)", borderColor: "rgba(0,0,0,0.07)" }}
        >
          {product.stats.map((stat, index) => (
            <div key={index} className="px-6 py-7 text-center" style={{ backgroundColor: "#fff" }}>
              <p className="mb-1 text-3xl font-black" style={{ color: accent }}>
                {textOf(lang, stat.value)}
              </p>
              <p className="text-[11px]" style={{ color: "rgba(10,20,40,0.45)" }}>
                {copy(stat.label)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="platform" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: accent }}
          >
            {copy(productChrome.platform)}
          </p>
          <h2 className="text-3xl font-bold" style={{ color: "#0a1428" }}>
            {fill(copy(productChrome.blocks), product.name)}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {product.modules.map(({ icon: Icon, title, description }, index) => (
            <div
              key={index}
              className="rounded-xl border bg-white p-5"
              style={{ borderColor: "rgba(0,0,0,0.07)" }}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border"
                style={{ backgroundColor: accentSoft, borderColor: accentBorder }}
              >
                <Icon className="h-4 w-4" style={{ color: accent }} />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold" style={{ color: "#0a1428" }}>
                {copy(title)}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(10,20,40,0.45)" }}>
                {copy(description)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="advantages" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: accent }}
          >
            {copy(productChrome.why)}
          </p>
          <h2 className="text-3xl font-bold" style={{ color: "#0a1428" }}>
            {copy(productChrome.beyond)}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {product.values.map(({ icon: Icon, title, description }, index) => (
            <div
              key={index}
              className="flex gap-4 rounded-xl border bg-white p-6"
              style={{ borderColor: "rgba(0,0,0,0.07)" }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
                style={{ backgroundColor: accentSoft, borderColor: accentBorder }}
              >
                <Icon className="h-5 w-5" style={{ color: accent }} />
              </div>
              <div>
                <h3 className="mb-1.5 text-sm font-semibold" style={{ color: "#0a1428" }}>
                  {copy(title)}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(10,20,40,0.45)" }}>
                  {copy(description)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="impact" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: accent }}
          >
            {copy(product.metricsLabel)}
          </p>
          <h2 className="text-3xl font-bold" style={{ color: "#0a1428" }}>
            {copy(product.metricsTitle)}
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {product.metrics.map((metric, index) => (
            <div
              key={index}
              className="w-64 rounded-xl border bg-white p-6 text-center"
              style={{ borderColor: "rgba(0,0,0,0.07)" }}
            >
              <p className="mb-2 text-4xl font-black" style={{ color: "#0a1428" }}>
                {textOf(lang, metric.value)}
              </p>
              <p className="text-[11px] leading-snug" style={{ color: "rgba(10,20,40,0.45)" }}>
                {copy(metric.label)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="cta" className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            background: `linear-gradient(135deg, ${hexToRgba(accent, 0.92)} 0%, #0a1428 100%)`,
          }}
        >
          <div
            className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border"
            style={{ backgroundColor: accentStrong, borderColor: hexToRgba(accent, 0.3) }}
          >
            <Zap className="h-6 w-6" style={{ color: "#ffffff" }} />
          </div>
          <h2 className="mb-3 text-3xl font-bold text-white">{copy(product.ctaTitle)}</h2>
          <p className="mx-auto mb-8 max-w-2xl text-sm" style={{ color: "rgba(255,255,255,0.74)" }}>
            {copy(product.ctaDescription)}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/site"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-semibold transition hover:opacity-90"
              style={{ color: "#0a1428" }}
            >
              {copy(productChrome.portfolio)} <ArrowRight className="h-4 w-4" />
            </Link>
            {product.comingSoon ? (
              <span
                className="inline-flex items-center gap-2 rounded-lg border px-8 py-3 text-sm font-semibold text-white"
                style={{ borderColor: "rgba(255,255,255,0.22)" }}
              >
                {copy(productChrome.comingSoon)}
              </span>
            ) : (
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 rounded-lg border px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.22)" }}
              >
                {copy(productChrome.access)}
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer
        className="relative z-10 mt-8 border-t py-10"
        style={{ backgroundColor: "#0a1428", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row"
          style={{ color: "rgba(255,255,255,0.32)" }}
        >
          <div className="flex items-center gap-4">
            <Image
              src={turbowareLogo}
              alt="Turboware"
              height={48}
              className="h-10 w-auto"
            />
            <p className="max-w-md text-[11px] leading-relaxed">{copy(product.footerNote)}</p>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <a href="#platform" className="transition hover:text-white/70">
              {copy(productChrome.platform)}
            </a>
            <a href="#advantages" className="transition hover:text-white/70">
              {copy(productChrome.why)}
            </a>
            <a href="#impact" className="transition hover:text-white/70">
              {copy(productChrome.impact)}
            </a>
            <Link href="/site" className="transition hover:text-white/70">
              {copy(productChrome.allProducts)}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
