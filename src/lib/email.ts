import nodemailer from 'nodemailer'

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required email environment variable: ${name}`)
  return value
}

function createTransporter() {
  const host = getRequiredEnv('SMTP_HOST')
  const port = Number(process.env.SMTP_PORT ?? 587)
  const user = getRequiredEnv('SMTP_USER')
  const pass = getRequiredEnv('SMTP_PASS')

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  })
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const baseUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const link    = `${baseUrl}/api/verify-email?token=${token}`
  const from    = process.env.SMTP_FROM ?? 'TurbowareV2 <noreply@turboware.com>'

  const transporter = createTransporter()
  await transporter.sendMail({
    from,
    to,
    subject: 'Verifique seu e-mail — TurbowareV2',
    text:    `Clique no link para verificar seu e-mail:\n\n${link}\n\nO link expira em 24 horas.`,
    html:    `<p>Clique no link abaixo para verificar seu e-mail:</p><p><a href="${link}">${link}</a></p><p>O link expira em 24 horas.</p>`,
  })
}

export async function sendAdminPasswordResetEmail(to: string, token: string): Promise<void> {
  const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const resetUrl = `${appUrl}/admin/reset-password?token=${encodeURIComponent(token)}`
  const from = process.env.SMTP_FROM ?? 'TurbowareV2 <noreply@turboware.com>'
  const transporter = createTransporter()

  await transporter.sendMail({
    from,
    to,
    subject: 'Reset your Turboware admin password',
    text: [
      'A password reset was requested for your Turboware account.',
      '',
      `Reset password: ${resetUrl}`,
      '',
      'This link expires in 30 minutes and can only be used once.',
      'If you did not request this, contact your platform administrator.',
    ].join('\n'),
    html: [
      '<p>A password reset was requested for your Turboware account.</p>',
      `<p><a href="${resetUrl}">Reset your password</a></p>`,
      '<p>This link expires in 30 minutes and can only be used once.</p>',
      '<p>If you did not request this, contact your platform administrator.</p>',
    ].join(''),
  })
}

export async function sendTemporaryPasswordEmail(to: string, temporaryPassword: string): Promise<void> {
  const from = process.env.SMTP_FROM ?? 'TurbowareV2 <noreply@turboware.com>'
  const transporter = createTransporter()

  await transporter.sendMail({
    from,
    to,
    subject: 'Senha temporaria do portal do cliente — TurbowareV2',
    text: [
      'Sua senha temporaria foi gerada.',
      '',
      `Senha temporaria: ${temporaryPassword}`,
      '',
      'Use essa senha para entrar no portal do cliente. Depois do login, voce sera obrigado a definir uma nova senha imediatamente.',
    ].join('\n'),
    html: [
      '<p>Sua senha temporaria foi gerada.</p>',
      `<p><strong>Senha temporaria:</strong> ${temporaryPassword}</p>`,
      '<p>Use essa senha para entrar no portal do cliente. Depois do login, voce sera obrigado a definir uma nova senha imediatamente.</p>',
    ].join(''),
  })
}
