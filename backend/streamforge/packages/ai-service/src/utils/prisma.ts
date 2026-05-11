import { PrismaClient } from '@prisma/client'
import { config } from './config'

const g = globalThis as { _aiPrisma?: PrismaClient }

export const prisma = g._aiPrisma ?? new PrismaClient({
  log: config.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (config.NODE_ENV !== 'production') g._aiPrisma = prisma
