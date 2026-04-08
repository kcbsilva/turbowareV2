import nodemailer from 'nodemailer'

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const baseUrl = process.env.APP_URL ?? 'http://localhost:3000'
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
