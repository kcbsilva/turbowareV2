'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { LoginNetworkBackdrop } from '@/components/LoginNetworkBackdrop'
import logo from '@/app/turboisp/assets/TurboISP-logo.png'
import '@/app/turboisp/login-surface.css'

export const loginLabelClass = 'block text-sm font-medium text-[#1a2333] mb-1.5'
const loginInputBase =
  'w-full h-11 rounded-md border border-[#1a2333]/15 bg-[#f4f6fa] text-[#1a2333] placeholder:text-[#1a2333]/40 text-sm outline-none transition-[border-color,box-shadow] focus:border-[#233b6e] focus:bg-white focus:ring-2 focus:ring-[#233b6e]/20'
export const loginInputClass = `${loginInputBase} px-3`
export const loginInputClassIcon = `${loginInputBase} pl-10 pr-3`
export const loginLinkClass =
  'text-sm font-medium text-[#233b6e] hover:text-[#fca311] underline-offset-4 hover:underline transition-colors'
export const loginBtnClass =
  'mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#fca311] text-sm font-semibold text-[#081124] transition-[background-color,transform,opacity] hover:bg-[#ffb83a] active:scale-[0.985] disabled:opacity-50'

type Props = {
  children: ReactNode
  title?: string
  subtitle?: string
  headerExtra?: ReactNode
  footer?: ReactNode
}

export function TurboAuthShell({ children, title, subtitle, headerExtra, footer }: Props) {
  const year = new Date().getFullYear()

  return (
    <section className="login-shell relative isolate flex min-h-dvh w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-[#e8ecf3] px-4 py-10 text-[#1a2333] antialiased">
      <LoginNetworkBackdrop />

      <motion.div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[#081124]/10 bg-white shadow-[0_24px_64px_-24px_rgba(8,17,36,0.35)]"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col justify-center px-8 py-10 sm:px-10">
          {headerExtra}

          <div className="mb-8">
            <div className={`flex justify-center ${title || subtitle ? 'mb-6' : ''}`}>
              <Image
                src={logo}
                alt="TurboISP"
                className="h-24 w-auto object-contain sm:h-28"
                priority
              />
            </div>
            {title && (
              <h1 className="login-heading text-center text-2xl font-semibold tracking-[-0.02em] text-[#081124]">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className={`text-center text-sm text-[#1a2333]/55 ${title ? 'mt-1.5' : ''}`}>
                {subtitle}
              </p>
            )}
          </div>

          {children}

          {footer && <div className="mt-5 text-center text-sm">{footer}</div>}

          <footer className="mt-8 text-center text-xs text-black space-y-2">
            <p>© {year} TurboISP</p>
          </footer>
        </div>
      </motion.div>
    </section>
  )
}
