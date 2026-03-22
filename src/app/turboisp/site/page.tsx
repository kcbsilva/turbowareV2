"use client"

import Link from 'next/link'
import {
  Network, Users, DollarSign, Wrench, BarChart3, ShoppingCart,
  Zap, Shield, Globe, ArrowRight, CheckCircle, TrendingUp,
  Radio, Map, Headphones, BookOpen
} from 'lucide-react'

// ── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '500+',  label: 'ISPs ativos' },
  { value: '2M+',   label: 'Assinantes gerenciados' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '45%',   label: 'Menos retrabalho' },
]

const MODULES = [
  {
    icon: Users,
    title: 'Assinantes',
    desc: 'Histórico unificado do assinante com ações rápidas, integrações WhatsApp e fluxos guiados de ativação, upgrade e retenção.',
    accent: '#fca311',
    bg: 'rgba(252,163,17,0.08)',
    border: 'rgba(252,163,17,0.18)',
  },
  {
    icon: Network,
    title: 'NOC',
    desc: 'Monitore backbone, POPs e última milha em tempo real. Alarmes contextuais para fibra, wireless, OLTs, roteadores e CPEs.',
    accent: '#3b82f6',
    bg: 'rgba(59,130,246,0.07)',
    border: 'rgba(59,130,246,0.15)',
  },
  {
    icon: Map,
    title: 'Infraestrutura',
    desc: 'Cabos, dutos, FDHs, FOSCs, torres, sites e racks mapeados com topologia visual e gestão de projetos integrada.',
    accent: '#10b981',
    bg: 'rgba(16,185,129,0.07)',
    border: 'rgba(16,185,129,0.15)',
  },
  {
    icon: DollarSign,
    title: 'Financeiro',
    desc: 'Faturamento automatizado, conciliações, projeções de receita e dashboards de inadimplência — sem planilhas.',
    accent: '#8b5cf6',
    bg: 'rgba(139,92,246,0.07)',
    border: 'rgba(139,92,246,0.15)',
  },
  {
    icon: Wrench,
    title: 'Ordens de Serviço',
    desc: 'Agendamento, despacho e execução de campo. Do chamado ao encerramento com SLA e histórico auditável.',
    accent: '#ef4444',
    bg: 'rgba(239,68,68,0.07)',
    border: 'rgba(239,68,68,0.15)',
  },
  {
    icon: TrendingUp,
    title: 'Comercial',
    desc: 'Leads, oportunidades, propostas e funil de vendas em uma visão única. Reduza churn e acelere conversões.',
    accent: '#06b6d4',
    bg: 'rgba(6,182,212,0.07)',
    border: 'rgba(6,182,212,0.15)',
  },
  {
    icon: ShoppingCart,
    title: 'Estoque',
    desc: 'Catálogo de produtos, fornecedores, almoxarifados, veículos e rastreio de materiais do pedido à instalação.',
    accent: '#f59e0b',
    bg: 'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.15)',
  },
  {
    icon: BarChart3,
    title: 'Relatórios',
    desc: 'Regulatório, contratos, DICI, SICI, PPSC e STFC. Conformidade multi-país sem esforço manual.',
    accent: '#ec4899',
    bg: 'rgba(236,72,153,0.07)',
    border: 'rgba(236,72,153,0.15)',
  },
  {
    icon: Radio,
    title: 'Playbooks',
    desc: 'Modelos operacionais prontos para implantação, expansão de POP, gestão de parceiros e campanhas — lance em menos de 15 dias.',
    accent: '#14b8a6',
    bg: 'rgba(20,184,166,0.07)',
    border: 'rgba(20,184,166,0.15)',
  },
]

const VALUES = [
  {
    icon: Zap,
    title: 'Automação primeiro',
    desc: 'Provisionamento, faturamento e fluxos de suporte automatizados. Menos cliques, mais resultado.',
  },
  {
    icon: Shield,
    title: 'Uma fonte de verdade',
    desc: 'NOC, comercial, suporte e financeiro no mesmo sistema — sem dados duplicados, sem desalinhamento.',
  },
  {
    icon: Globe,
    title: 'Escala com previsibilidade',
    desc: 'Preveja bandwidth, estoque e equipe combinando dados de consumo, tickets e rede.',
  },
  {
    icon: Headphones,
    title: 'Suporte resolutivo',
    desc: 'Histórico unificado do assinante com integração WhatsApp. Resolva no primeiro contato.',
  },
]

const METRICS = [
  { stat: '+32%', label: 'produtividade com Turbo Playbooks' },
  { stat: '99',   label: 'KPIs acompanhados em tempo real' },
  { stat: '<15',  label: 'dias para lançar um playbook' },
  { stat: '45%',  label: 'menos retrabalho backbone-to-billing' },
]

// ── Page ────────────────────────────────────────────────────────────────────

export default function TurboISPSitePage() {
  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden" style={{ backgroundColor: '#e5e5e5' }}>

      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 border-b"
        style={{
          backgroundColor: 'rgba(229,229,229,0.92)',
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(0,0,0,0.08)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
              style={{ backgroundColor: '#fca311' }}
            >
              <Network className="w-4 h-4" style={{ color: '#081124' }} />
            </div>
            <span className="text-sm font-black tracking-tight" style={{ color: '#0a1428' }}>
              Turbo<span style={{ color: '#fca311' }}>ISP</span>
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-xs" style={{ color: 'rgba(10,20,40,0.5)' }}>
            <a href="#modules"   className="hover:text-[#0a1428] transition">Módulos</a>
            <a href="#valores"   className="hover:text-[#0a1428] transition">Por que TurboISP</a>
            <a href="#metricas"  className="hover:text-[#0a1428] transition">Resultados</a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="text-xs px-3 py-1.5 transition"
              style={{ color: 'rgba(10,20,40,0.45)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0a1428')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(10,20,40,0.45)')}
            >
              Entrar
            </Link>
            <Link
              href="/turboisp/register"
              className="text-xs font-semibold px-4 py-1.5 rounded-md transition hover:opacity-90 shadow-sm"
              style={{ backgroundColor: '#fca311', color: '#081124' }}
            >
              Solicitar demo
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-8 border"
          style={{
            backgroundColor: 'rgba(252,163,17,0.1)',
            borderColor: 'rgba(252,163,17,0.25)',
            color: '#b87200',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#fca311] animate-pulse" />
          Plataforma de gestão para ISPs
        </div>

        <h1
          className="text-5xl md:text-6xl font-black tracking-tight leading-[1.08] mb-6"
          style={{ color: '#0a1428' }}
        >
          A plataforma que{' '}
          <span style={{ color: '#fca311' }}>acelera</span>
          <br />o crescimento da sua operação
        </h1>

        <p
          className="text-base max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'rgba(10,20,40,0.5)' }}
        >
          TurboISP unifica NOC, comercial, suporte e financeiro em um único sistema operacional —
          para você escalar serviço, receita e confiabilidade com uma só fonte de verdade.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/turboisp/register"
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition hover:opacity-90 shadow-sm"
            style={{ backgroundColor: '#fca311', color: '#081124' }}
          >
            Solicitar demo <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#modules"
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium border transition hover:bg-black/5"
            style={{ borderColor: 'rgba(0,0,0,0.12)', color: 'rgba(10,20,40,0.6)' }}
          >
            Ver módulos <BookOpen className="w-4 h-4" />
          </a>
        </div>

        {/* Trust badges */}
        <div
          className="mt-14 flex items-center justify-center gap-6 flex-wrap text-[10px] uppercase tracking-widest"
          style={{ color: 'rgba(10,20,40,0.3)' }}
        >
          {['Self-hosted', 'Multi-operadora', 'GPON / Wireless', 'Conformidade regulatória', 'Integrações WhatsApp'].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3" style={{ color: 'rgba(252,163,17,0.55)' }} />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-16">
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border shadow-sm"
          style={{ backgroundColor: 'rgba(0,0,0,0.07)', borderColor: 'rgba(0,0,0,0.07)' }}
        >
          {STATS.map(({ value, label }) => (
            <div key={label} className="py-7 px-6 text-center" style={{ backgroundColor: '#fff' }}>
              <p className="text-3xl font-black mb-1" style={{ color: '#fca311' }}>{value}</p>
              <p className="text-[11px]" style={{ color: 'rgba(10,20,40,0.45)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Modules ───────────────────────────────────────────────────────── */}
      <section id="modules" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#b87200' }}
          >
            Módulos
          </p>
          <h2 className="text-3xl font-bold" style={{ color: '#0a1428' }}>
            Tudo que sua operação precisa, em um só lugar
          </h2>
          <p className="text-sm mt-3 max-w-lg mx-auto" style={{ color: 'rgba(10,20,40,0.45)' }}>
            Cada módulo foi construído para ISPs reais — e todos falam entre si.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map(({ icon: Icon, title, desc, accent, bg, border }) => (
            <div
              key={title}
              className="p-5 rounded-xl border"
              style={{ backgroundColor: '#fff', borderColor: 'rgba(0,0,0,0.07)' }}
            >
              <div
                className="w-9 h-9 rounded-lg border flex items-center justify-center mb-4"
                style={{ backgroundColor: bg, borderColor: border }}
              >
                <Icon className="w-4 h-4" style={{ color: accent }} />
              </div>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#0a1428' }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(10,20,40,0.45)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Value props ───────────────────────────────────────────────────── */}
      <section id="valores" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#b87200' }}
          >
            Por que TurboISP
          </p>
          <h2 className="text-3xl font-bold" style={{ color: '#0a1428' }}>
            Construído para quem opera de verdade
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-4 p-6 rounded-xl border"
              style={{ backgroundColor: '#fff', borderColor: 'rgba(0,0,0,0.07)' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                style={{ backgroundColor: 'rgba(252,163,17,0.08)', borderColor: 'rgba(252,163,17,0.2)' }}
              >
                <Icon className="w-5 h-5" style={{ color: '#fca311' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#0a1428' }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(10,20,40,0.45)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Metrics ───────────────────────────────────────────────────────── */}
      <section id="metricas" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#b87200' }}
          >
            Resultados reais
          </p>
          <h2 className="text-3xl font-bold" style={{ color: '#0a1428' }}>
            Números que a sua operação vai sentir
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {METRICS.map(({ stat, label }) => (
            <div
              key={label}
              className="p-6 rounded-xl border text-center"
              style={{ backgroundColor: '#fff', borderColor: 'rgba(0,0,0,0.07)' }}
            >
              <p className="text-4xl font-black mb-2" style={{ color: '#0a1428' }}>{stat}</p>
              <p className="text-[11px] leading-snug" style={{ color: 'rgba(10,20,40,0.45)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, #0a1428 0%, #14213d 100%)',
          }}
        >
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5"
            style={{ backgroundColor: 'rgba(252,163,17,0.15)', border: '1px solid rgba(252,163,17,0.25)' }}
          >
            <Zap className="w-6 h-6" style={{ color: '#fca311' }} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Pronto para turbinar sua operação?
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Fale com um especialista TurboISP e veja como a plataforma se encaixa na sua realidade.
          </p>
          <Link
            href="/turboisp/register"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold transition hover:opacity-90 shadow-md"
            style={{ backgroundColor: '#fca311', color: '#081124' }}
          >
            Solicitar demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        className="relative z-10 mt-8 py-10 border-t"
        style={{ backgroundColor: '#0a1428', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#fca311' }}>
              <Network className="w-3.5 h-3.5" style={{ color: '#081124' }} />
            </div>
            <span className="text-sm font-black" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Turbo<span style={{ color: '#fca311' }}>ISP</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-[11px]">
            <a href="#modules"  className="hover:text-white/60 transition">Módulos</a>
            <a href="#valores"  className="hover:text-white/60 transition">Por que TurboISP</a>
            <a href="#metricas" className="hover:text-white/60 transition">Resultados</a>
            <Link href="/turboisp/register" className="hover:text-white/60 transition">Demo</Link>
            <Link href="/admin/login"       className="hover:text-white/60 transition">Admin</Link>
          </div>

          <p className="text-[10px]">© {new Date().getFullYear()} TurboISP. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  )
}
