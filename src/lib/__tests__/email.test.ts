import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-id' })
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail: mockSendMail })),
  },
}))

import { sendVerificationEmail } from '../email'

describe('sendVerificationEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_USER = 'user@example.com'
    process.env.SMTP_PASS = 'secret'
    process.env.APP_URL   = 'https://app.turboware.com'
    delete process.env.SMTP_FROM
  })

  it('calls sendMail with the verification link in html and text', async () => {
    await sendVerificationEmail('client@example.com', 'abc123token')
    expect(mockSendMail).toHaveBeenCalledOnce()
    const mail = mockSendMail.mock.calls[0][0]
    expect(mail.to).toBe('client@example.com')
    expect(mail.html).toContain('https://app.turboware.com/api/verify-email?token=abc123token')
    expect(mail.text).toContain('https://app.turboware.com/api/verify-email?token=abc123token')
  })

  it('uses SMTP_FROM env var as sender when set', async () => {
    process.env.SMTP_FROM = 'Custom <custom@example.com>'
    await sendVerificationEmail('client@example.com', 'token')
    const mail = mockSendMail.mock.calls[0][0]
    expect(mail.from).toBe('Custom <custom@example.com>')
  })

  it('falls back to default sender when SMTP_FROM is not set', async () => {
    await sendVerificationEmail('client@example.com', 'token')
    const mail = mockSendMail.mock.calls[0][0]
    expect(mail.from).toContain('TurbowareV2')
  })

  it('uses APP_URL env var for the link base', async () => {
    process.env.APP_URL = 'https://custom.domain.com'
    await sendVerificationEmail('client@example.com', 'mytoken')
    const mail = mockSendMail.mock.calls[0][0]
    expect(mail.html).toContain('https://custom.domain.com/api/verify-email?token=mytoken')
  })
})
