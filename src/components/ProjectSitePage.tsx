import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle, Zap } from "lucide-react";

import turbowareLogo from "@/app/assets/turboware-logo.png";
import type { ProductSiteContent } from "@/lib/project-site-content";

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

type Props = {
  product: ProductSiteContent;
};

export function ProjectSitePage({ product }: Props) {
  const accent = product.accent;
  const accentSoft = hexToRgba(accent, 0.12);
  const accentBorder = hexToRgba(accent, 0.24);
  const accentStrong = hexToRgba(accent, 0.18);
  const primaryLabel = product.comingSoon ? "Coming soon" : "Explore the platform";

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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
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
                {product.category}
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
              Platform
            </a>
            <a href="#advantages" className="transition hover:text-[#0a1428]">
              Why it matters
            </a>
            <a href="#impact" className="transition hover:text-[#0a1428]">
              Impact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/site"
              className="hidden text-xs transition sm:inline"
              style={{ color: "rgba(10,20,40,0.45)" }}
            >
              All products
            </Link>
            {product.comingSoon ? (
              <span
                className="rounded-md px-4 py-2 text-xs font-semibold"
                style={{
                  backgroundColor: accentSoft,
                  border: `1px solid ${accentBorder}`,
                  color: accent,
                }}
              >
                Coming soon
              </span>
            ) : (
              <Link
                href="/admin/login"
                className="rounded-md px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                Platform access
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
          {product.badge}
        </div>

        <h1
          className="mb-6 text-5xl font-black leading-[1.08] tracking-tight md:text-6xl"
          style={{ color: "#0a1428" }}
        >
          {product.heroTitle}
        </h1>

        <p
          className="mx-auto mb-10 max-w-3xl text-base leading-relaxed"
          style={{ color: "rgba(10,20,40,0.55)" }}
        >
          {product.heroSubtitle}
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
            Back to products <BookOpen className="h-4 w-4" />
          </Link>
        </div>

        <div
          className="mt-14 flex flex-wrap items-center justify-center gap-6 text-[10px] uppercase tracking-widest"
          style={{ color: "rgba(10,20,40,0.34)" }}
        >
          {product.trustBadges.map((badge) => (
            <span key={badge} className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3" style={{ color: accent }} />
              {badge}
            </span>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16">
        <div
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border shadow-sm md:grid-cols-4"
          style={{ backgroundColor: "rgba(0,0,0,0.07)", borderColor: "rgba(0,0,0,0.07)" }}
        >
          {product.stats.map((stat) => (
            <div key={stat.label} className="px-6 py-7 text-center" style={{ backgroundColor: "#fff" }}>
              <p className="mb-1 text-3xl font-black" style={{ color: accent }}>
                {stat.value}
              </p>
              <p className="text-[11px]" style={{ color: "rgba(10,20,40,0.45)" }}>
                {stat.label}
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
            Platform
          </p>
          <h2 className="text-3xl font-bold" style={{ color: "#0a1428" }}>
            Core building blocks for {product.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {product.modules.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
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
                {title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(10,20,40,0.45)" }}>
                {description}
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
            Why it matters
          </p>
          <h2 className="text-3xl font-bold" style={{ color: "#0a1428" }}>
            Value created beyond the feature checklist
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {product.values.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
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
                  {title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(10,20,40,0.45)" }}>
                  {description}
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
            {product.metricsLabel}
          </p>
          <h2 className="text-3xl font-bold" style={{ color: "#0a1428" }}>
            {product.metricsTitle}
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {product.metrics.map((metric) => (
            <div
              key={metric.label}
              className="w-64 rounded-xl border bg-white p-6 text-center"
              style={{ borderColor: "rgba(0,0,0,0.07)" }}
            >
              <p className="mb-2 text-4xl font-black" style={{ color: "#0a1428" }}>
                {metric.value}
              </p>
              <p className="text-[11px] leading-snug" style={{ color: "rgba(10,20,40,0.45)" }}>
                {metric.label}
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
          <h2 className="mb-3 text-3xl font-bold text-white">{product.ctaTitle}</h2>
          <p className="mx-auto mb-8 max-w-2xl text-sm" style={{ color: "rgba(255,255,255,0.74)" }}>
            {product.ctaDescription}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/site"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-semibold transition hover:opacity-90"
              style={{ color: "#0a1428" }}
            >
              Explore the Turboware portfolio <ArrowRight className="h-4 w-4" />
            </Link>
            {product.comingSoon ? (
              <span
                className="inline-flex items-center gap-2 rounded-lg border px-8 py-3 text-sm font-semibold text-white"
                style={{ borderColor: "rgba(255,255,255,0.22)" }}
              >
                Coming soon
              </span>
            ) : (
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 rounded-lg border px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.22)" }}
              >
                Platform access
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
              className="h-10 w-auto brightness-0 invert opacity-60"
            />
            <p className="max-w-md text-[11px] leading-relaxed">{product.footerNote}</p>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <a href="#platform" className="transition hover:text-white/70">
              Platform
            </a>
            <a href="#advantages" className="transition hover:text-white/70">
              Why it matters
            </a>
            <a href="#impact" className="transition hover:text-white/70">
              Impact
            </a>
            <Link href="/site" className="transition hover:text-white/70">
              All products
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
