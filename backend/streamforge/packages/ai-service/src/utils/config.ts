import { z } from 'zod'

const schema = z.object({
  NODE_ENV:     z.enum(['development', 'test', 'production']).default('development'),
  PORT:         z.coerce.number().default(3004),
  HOST:         z.string().default('0.0.0.0'),
  LOG_LEVEL:    z.enum(['fatal','error','warn','info','debug','trace']).default('info'),
  SERVICE_NAME: z.string().default('ai-service'),
  DATABASE_URL:  z.string().url(),
  REDIS_URL:     z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET:       z.string().min(32),
  INTERNAL_SERVICE_SECRET: z.string().min(32),
  GOOGLE_CLOUD_PROJECT_ID:        z.string(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string(),
  VISION_API_ENABLED:  z.coerce.boolean().default(true),
  VISION_MAX_RESULTS:  z.coerce.number().default(20),
  TRANSLATE_API_ENABLED:         z.coerce.boolean().default(true),
  TRANSLATE_DEFAULT_TARGET_LANG: z.string().default('en'),
  TRANSLATE_SUPPORTED_LANGS:     z.string().default('en,es,fr,de,zh,ja,ko,ar,pt,ru,hi,it'),
  OPENAI_API_KEY:    z.string(),
  OPENAI_MODEL:      z.string().default('gpt-4o-mini'),
  OPENAI_MAX_TOKENS: z.coerce.number().default(500),
  R2_ACCOUNT_ID:        z.string(),
  R2_ACCESS_KEY_ID:     z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_BUCKET_NAME:  z.string().default('streamforge-ai'),
  R2_PUBLIC_URL:   z.string().url(),
  AI_PLANS_ALLOWED:               z.string().default('PRO,CREATOR,ENTERPRISE'),
  AI_REQUESTS_PER_MIN_PRO:        z.coerce.number().default(30),
  AI_REQUESTS_PER_MIN_CREATOR:    z.coerce.number().default(100),
  AI_REQUESTS_PER_MIN_ENTERPRISE: z.coerce.number().default(500),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('AI Service — invalid environment:')
  parsed.error.issues.forEach(i => console.error(`  ${i.path.join('.')}: ${i.message}`))
  process.exit(1)
}

export const config = parsed.data
export type Config  = typeof config
