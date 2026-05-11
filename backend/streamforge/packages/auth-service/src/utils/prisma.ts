// ============================================================
//  Prisma Client Singleton
// ============================================================

import { PrismaClient } from '../generated/prisma/client'
import { config } from './config'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      config.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    errorFormat: 'pretty',
  })

if (config.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Extend Prisma with soft-delete middleware (future use)
prisma.$use(async (params, next) => {
  // Query timing for observability
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()

  if (config.NODE_ENV === 'development' && after - before > 500) {
    console.warn(
      `⚠️  Slow query detected: ${params.model}.${params.action} took ${after - before}ms`
    )
  }

  return result
})

export type { PrismaClient }
