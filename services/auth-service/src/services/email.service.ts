// ============================================================
//  EmailService — Transactional email via Nodemailer
// ============================================================

import nodemailer from 'nodemailer'
import { config } from '../utils/config'
import { logger } from '../utils/logger'

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host:   config.SMTP_HOST,
      port:   config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    })
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    token: string
  ): Promise<void> {
    const url = `${config.FRONTEND_URL}/verify-email?token=${token}`

    await this.send({
      to,
      subject: 'Verify your StreamForge email',
      html: this.renderTemplate({
        title: 'Verify your email',
        preheader: 'One click to activate your StreamForge account',
        body: `
          <p>Hi ${this.escape(name)},</p>
          <p>Welcome to <strong>StreamForge</strong>! Click the button below to verify your email address and start creating.</p>
          <p style="text-align:center; margin: 32px 0;">
            <a href="${url}" class="button">Verify Email Address</a>
          </p>
          <p class="hint">This link expires in <strong>24 hours</strong>. If you didn't sign up, you can safely ignore this email.</p>
        `,
      }),
    })
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    token: string
  ): Promise<void> {
    const url = `${config.FRONTEND_URL}/reset-password?token=${token}`

    await this.send({
      to,
      subject: 'Reset your StreamForge password',
      html: this.renderTemplate({
        title: 'Reset your password',
        preheader: 'A password reset was requested for your account',
        body: `
          <p>Hi ${this.escape(name)},</p>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <p style="text-align:center; margin: 32px 0;">
            <a href="${url}" class="button">Reset Password</a>
          </p>
          <p class="hint">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email — your password will remain unchanged.</p>
        `,
      }),
    })
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.send({
      to,
      subject: 'Welcome to StreamForge 🎬',
      html: this.renderTemplate({
        title: 'Welcome to StreamForge!',
        preheader: 'Your streaming studio is ready',
        body: `
          <p>Hi ${this.escape(name)},</p>
          <p>Your StreamForge account is all set! Here's what you can do with your free plan:</p>
          <ul>
            <li>🎥 Stream to 1 platform at 720p</li>
            <li>✂️ Edit and export videos up to 5GB</li>
            <li>🎬 Create up to 3 projects</li>
          </ul>
          <p>Ready to go live? Upgrade to <strong>Pro</strong> for multi-platform streaming and 1080p quality.</p>
          <p style="text-align:center; margin: 32px 0;">
            <a href="${config.FRONTEND_URL}/studio" class="button">Open Studio</a>
          </p>
        `,
      }),
    })
  }

  async sendPasswordChangedNotification(to: string, name: string): Promise<void> {
    await this.send({
      to,
      subject: 'Your StreamForge password was changed',
      html: this.renderTemplate({
        title: 'Password changed',
        preheader: 'Your password was recently changed',
        body: `
          <p>Hi ${this.escape(name)},</p>
          <p>Your password was successfully changed. All existing sessions have been signed out.</p>
          <p class="hint">If you didn't make this change, please <a href="${config.FRONTEND_URL}/forgot-password">reset your password immediately</a> and contact support.</p>
        `,
      }),
    })
  }

  // ─── Private helpers ──────────────────────────────────────────
  private async send(options: {
    to: string
    subject: string
    html: string
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from:    config.EMAIL_FROM,
        to:      options.to,
        subject: options.subject,
        html:    options.html,
      })
      logger.debug({ to: options.to, subject: options.subject }, 'Email sent')
    } catch (err) {
      logger.error({ err, to: options.to }, 'Failed to send email')
      throw err
    }
  }

  private escape(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  private renderTemplate(opts: {
    title: string
    preheader: string
    body: string
  }): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${opts.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; margin: 0; padding: 0; color: #e5e5e5; }
    .preheader { display: none; max-height: 0; overflow: hidden; }
    .wrapper { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 40px; }
    .logo { font-size: 22px; font-weight: 700; color: #6366f1; margin-bottom: 32px; letter-spacing: -0.5px; }
    h1 { font-size: 24px; font-weight: 700; color: #ffffff; margin: 0 0 16px; }
    p { font-size: 15px; line-height: 1.6; color: #a0a0a0; margin: 0 0 16px; }
    ul { padding-left: 20px; } li { font-size: 15px; line-height: 1.8; color: #a0a0a0; }
    .button { display: inline-block; background: #6366f1; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; }
    .hint { font-size: 13px; color: #666; }
    .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #555; }
    a { color: #6366f1; }
  </style>
</head>
<body>
  <span class="preheader">${opts.preheader}</span>
  <div class="wrapper">
    <div class="card">
      <div class="logo">StreamForge ▶</div>
      <h1>${opts.title}</h1>
      ${opts.body}
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} StreamForge. All rights reserved.<br>
      You're receiving this because you have a StreamForge account.
    </div>
  </div>
</body>
</html>`
  }
}
