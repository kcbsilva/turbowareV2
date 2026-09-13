'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LoginNetworkBackdrop } from '@/components/LoginNetworkBackdrop'
import '@/app/turboisp/login-surface.css'

export const loginLabelClass = 'block text-sm font-medium text-neutral-300 mb-1.5'
const loginInputBase =
  'w-full h-11 rounded-md border border-white/10 bg-white/5 text-neutral-100 placeholder:text-neutral-500 text-sm outline-none transition-[border-color,box-shadow] focus:border-white/30 focus:bg-black focus:ring-2 focus:ring-white/10'
export const loginInputClass = `${loginInputBase} px-3`
export const loginInputClassIcon = `${loginInputBase} pl-10 pr-3`
export const loginLinkClass =
  'text-sm font-medium text-neutral-300 hover:text-white underline-offset-4 hover:underline transition-colors'
export const loginBtnClass =
  'mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white text-sm font-semibold text-black transition-[background-color,transform,opacity] hover:bg-neutral-200 active:scale-[0.985] disabled:opacity-50'

type Props = {
  children: ReactNode
  title?: string
  subtitle?: string
  headerExtra?: ReactNode
  footer?: ReactNode
  ipLabel?: string
}

export function TurboAuthShell({
  children,
  title,
  subtitle,
  headerExtra,
  footer,
  ipLabel = 'Your IP',
}: Props) {
  const year = new Date().getFullYear()
  const [visitorIP, setVisitorIP] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/ip')
      .then((res) => res.json())
      .then((data: { ip?: string }) => {
        if (!cancelled && data.ip) setVisitorIP(data.ip)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="login-shell relative isolate flex min-h-dvh w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-black px-4 py-10 text-neutral-200 antialiased">
      <LoginNetworkBackdrop />

      <motion.div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[0_24px_64px_-24px_rgba(0,0,0,0.8)]"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col justify-center px-8 py-10 sm:px-10">
          {headerExtra}

          <div className="mb-8">
            <div className="mb-6 flex justify-center">
              <img
                src="/favicon.svg"
                alt="Turboware"
                className="h-16 w-16 object-contain"
              />
            </div>
            {title && (
              <h1 className="login-heading text-center text-2xl font-semibold tracking-[-0.02em] text-white">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className={`text-center text-sm text-neutral-400 ${title ? 'mt-1.5' : ''}`}>
                {subtitle}
              </p>
            )}
          </div>

          {children}

          {footer && <div className="mt-5 text-center text-sm">{footer}</div>}

          <footer className="mt-8 text-center text-xs text-neutral-500 space-y-2">
            {visitorIP && (
              <p className="text-xs font-medium text-neutral-400">
                {ipLabel}: {visitorIP}
              </p>
            )}
            <p>© {year} Turboware</p>
          </footer>
        </div>
      </motion.div>
    </section>
  )
}
