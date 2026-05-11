// ============================================================
//  Config — Validated environment variables
// ============================================================

import { z } from 'zod'

const configSchema = z.object({
  NODE_ENV:     z.enum(['development', 'test', 'production']).default('development'),
  PORT:         z.coerce.number().default(3001),
  HOST:         z.string().default('0.0.0.0'),
  LOG_LEVEL:    z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  SERVICE_NAME: z.string().default('auth-service'),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL:      z.string().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_ACCESS_SECRET:    z.string().min(32),
  JWT_REFRESH_SECRET:   z.string().min(32),
  JWT_ACCESS_EXPIRES_IN:  z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Cookie
  COOKIE_SECRET: z.string().min(32),
  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: z.coerce.boolean().default(false),

  // Stripe
  STRIPE_SECRET_KEY:           z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET:       z.string().startsWith('whsec_'),
  STRIPE_PRO_PRICE_ID:         z.string(),
  STRIPE_CREATOR_PRICE_ID:     z.string(),
  STRIPE_ENTERPRISE_PRICE_ID:  z.string(),

  // Regional payments
  FLUTTERWAVE_SECRET_KEY:      z.string().optional(),
  FLUTTERWAVE_PUBLIC_KEY:      z.string().optional(),
  FLUTTERWAVE_REDIRECT_URL:    z.string().url().optional(),
  FLUTTERWAVE_WEBHOOK_HASH:    z.string().optional(),
  PAYSTACK_SECRET_KEY:         z.string().optional(),
  PAYSTACK_PUBLIC_KEY:         z.string().optional(),
  PAYSTACK_REDIRECT_URL:       z.string().url().optional(),

  // Email
  SMTP_HOST:   z.string(),
  SMTP_PORT:   z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER:   z.string(),
  SMTP_PASS:   z.string(),
  EMAIL_FROM:  z.string(),

  // OAuth
  GOOGLE_CLIENT_ID:     z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  // URLs
  APP_URL:      z.string().url(),
  API_URL:      z.string().url(),
  FRONTEND_URL: z.string().url(),

  // Rate limiting
  RATE_LIMIT_MAX:       z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),

  // Internal
  INTERNAL_SERVICE_SECRET: z.string().min(32),
})

// Parse and validate — throws on missing/invalid values at startup
const parsed = configSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:')
  parsed.error.issues.forEach(issue => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`)
  })
  process.exit(1)
}

export const config = parsed.data
export type Config = typeof config
