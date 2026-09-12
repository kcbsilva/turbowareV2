'use client'

import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LoaderCircle, Lock, Mail } from 'lucide-react'
import logo from '@/app/turboisp/assets/TurboISP-logo.png'
import { LoginNetworkBackdrop } from '@/components/auth/LoginNetworkBackdrop'
import { cn } from '@/lib/utils'

export const loginLabelClass = 'block text-sm font-medium text-[#1a2333] mb-1.5'
export const loginInputClass =
  'w-full h-11 rounded-md border border-[#1a2333]/15 bg-[#f4f6fa] text-[#1a2333] placeholder:text-[#1a2333]/40 text-sm outline-none transition-[border-color,box-shadow] focus:border-[#233b6e] focus:bg-white focus:ring-2 focus:ring-[#233b6e]/20'
export const loginInputPadClass = `${loginInputClass} px-3`
export const loginInputWithIconClass = `${loginInputClass} pl-10 pr-3`
export const loginLinkClass =
  'text-sm font-medium text-[#233b6e] hover:text-[#fca311] underline-offset-4 hover:underline transition-colors'

const MFA_LEN = 6
const mfaDigitClass =
  'h-12 w-10 rounded-md border border-[#1a2333]/15 bg-[#f4f6fa] text-center text-lg font-semibold text-[#1a2333] outline-none transition-[border-color,box-shadow] focus:border-[#233b6e] focus:bg-white focus:ring-2 focus:ring-[#233b6e]/20 sm:h-12 sm:w-11'

type FrameProps = {
  children: ReactNode
  cardClassName?: string
}

export function AuthPageFrame({ children, cardClassName = 'max-w-md' }: FrameProps) {
  return (
    <section className="login-shell relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#e8ecf3] px-4 py-10 text-[#1a2333] antialiased">
      <LoginNetworkBackdrop />
      <motion.div
        className={cn(
          'relative z-10 w-full overflow-hidden rounded-2xl border border-[#081124]/10 bg-white shadow-[0_24px_64px_-24px_rgba(8,17,36,0.35)]',
          cardClassName,
        )}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </section>
  )
}

type ShellProps = {
  title: string
  subtitle?: string
  error?: string
  isSubmitting?: boolean
  submitDisabled?: boolean
  showSubmit?: boolean
  submitLabel: string
  submitPendingLabel: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  toolbar?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

export function LoginShell({
  title,
  subtitle,
  error,
  isSubmitting = false,
  submitDisabled = false,
  showSubmit = true,
  submitLabel,
  submitPendingLabel,
  onSubmit,
  toolbar,
  footer,
  children,
}: ShellProps) {
  const disabled = isSubmitting

  return (
    <AuthPageFrame>
      <div className="flex flex-col justify-center px-8 py-10 sm:px-10">
        {toolbar && <div className="mb-4 flex justify-end">{toolbar}</div>}
        <div className="mb-8">
          <div className={cn('flex justify-center', (title || subtitle) && 'mb-6')}>
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
            <p className={cn('text-center text-sm text-[#1a2333]/55', title && 'mt-1.5')}>
              {subtitle}
            </p>
          )}
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <fieldset disabled={disabled} className="space-y-4">
            {children}
            {showSubmit && (
              <button
                type="submit"
                disabled={disabled || submitDisabled}
                className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#fca311] text-sm font-semibold text-[#081124] transition-[background-color,transform,opacity] hover:bg-[#ffb83a] active:scale-[0.985] disabled:opacity-50"
              >
                {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {isSubmitting ? submitPendingLabel : submitLabel}
              </button>
            )}
          </fieldset>
        </form>

        {footer && <div className="mt-5 text-center text-sm">{footer}</div>}
      </div>
    </AuthPageFrame>
  )
}

type PasswordProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  placeholder?: string
  autoFocus?: boolean
  hideToggleLabel?: string
  showToggleLabel?: string
}

export function LoginPasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete = 'current-password',
  placeholder = '••••••••',
  autoFocus,
  hideToggleLabel = 'Hide password',
  showToggleLabel = 'Show password',
}: PasswordProps) {
  const [show, setShow] = useState(false)

  return (
    <div>
      <label htmlFor={id} className={loginLabelClass}>{label}</label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a2333]/35" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${loginInputWithIconClass} pr-11`}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#1a2333]/35 transition-colors hover:text-[#1a2333]"
          aria-label={show ? hideToggleLabel : showToggleLabel}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

type EmailProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  autoFocus?: boolean
  required?: boolean
}

export function LoginEmailField({
  id,
  label,
  value,
  onChange,
  placeholder = 'admin@example.com',
  autoComplete = 'email',
  autoFocus,
  required,
}: EmailProps) {
  return (
    <div>
      <label htmlFor={id} className={loginLabelClass}>{label}</label>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a2333]/35" />
        <input
          id={id}
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={loginInputWithIconClass}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required={required}
        />
      </div>
    </div>
  )
}

type MfaProps = {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function LoginMfaCodeField({
  value,
  onChange,
  label = 'Authenticator code',
}: MfaProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length: MFA_LEN }, (_, i) => value[i] ?? '')
  const emptyFocus = useRef(value.length === 0)

  useEffect(() => {
    if (value === '') {
      if (!emptyFocus.current) refs.current[0]?.focus()
      emptyFocus.current = true
      return
    }
    emptyFocus.current = false
  }, [value])

  function apply(next: string, submitIfComplete: boolean) {
    const cleaned = next.replace(/\D/g, '').slice(0, MFA_LEN)
    onChange(cleaned)
    const idx = Math.min(cleaned.length, MFA_LEN - 1)
    refs.current[idx]?.focus()
    if (submitIfComplete && cleaned.length === MFA_LEN) {
      const form = refs.current[0]?.form
      form && queueMicrotask(() => form.requestSubmit())
    }
  }

  function onDigitChange(index: number, raw: string) {
    const digitsOnly = raw.replace(/\D/g, '')
    if (digitsOnly.length > 1) {
      apply(digitsOnly, digitsOnly.length >= MFA_LEN)
      return
    }
    if (digitsOnly.length === 0) {
      apply(value.slice(0, index), false)
      return
    }
    const next = (value.slice(0, index) + digitsOnly.slice(-1)).slice(0, MFA_LEN)
    apply(next, next.length === MFA_LEN)
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (digits[index]) {
        apply(value.slice(0, index), false)
        return
      }
      if (index > 0) apply(value.slice(0, index - 1), false)
      return
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      refs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowRight' && index < MFA_LEN - 1) {
      event.preventDefault()
      refs.current[index + 1]?.focus()
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return
    event.preventDefault()
    apply(pasted, pasted.length >= MFA_LEN)
  }

  return (
    <div>
      <p id="mfa-code-label" className={loginLabelClass}>{label}</p>
      <div role="group" aria-labelledby="mfa-code-label" className="flex items-center justify-between gap-1.5 sm:gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { refs.current[index] = el }}
            id={index === 0 ? 'mfa-code' : `mfa-digit-${index}`}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            autoFocus={index === 0}
            maxLength={index === 0 ? MFA_LEN : 1}
            value={digit}
            aria-label={`Digit ${index + 1}`}
            onChange={(e) => onDigitChange(index, e.target.value)}
            onKeyDown={(e) => onKeyDown(index, e)}
            onPaste={onPaste}
            onFocus={(e) => e.target.select()}
            className={mfaDigitClass}
          />
        ))}
      </div>
    </div>
  )
}
