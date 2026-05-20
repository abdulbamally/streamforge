// utils/logger.ts
import pino from 'pino'
import { config } from './config'

export const logger = pino({
  level: config.LOG_LEVEL,
  base:  { service: config.SERVICE_NAME },
  ...(config.NODE_ENV === 'development' && {
    transport: { target: 'pino-pretty', options: { colorize: true } },
  }),
})

// utils/prisma.ts — re-export from same pattern
import { PrismaClient } from '@streamforge/auth-service/prisma'
const g = globalThis as { _mediaPrisma?: PrismaClient }
export const prisma = g._mediaPrisma ?? new PrismaClient({ log: ['error'] })
if (config.NODE_ENV !== 'production') g._mediaPrisma = prisma
