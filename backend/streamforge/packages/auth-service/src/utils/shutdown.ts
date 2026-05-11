// ============================================================
//  Graceful Shutdown
// ============================================================

import type { FastifyInstance } from 'fastify'
import { logger } from './logger'

type CleanupFn = () => Promise<void> | void

export function gracefulShutdown(
  app: FastifyInstance,
  cleanupFns: CleanupFn[] = []
): void {
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`)

    // Stop accepting new requests
    await app.close()

    // Run cleanup functions
    await Promise.allSettled(cleanupFns.map(fn => fn()))

    logger.info('✅ Graceful shutdown complete')
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))

  process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Unhandled promise rejection')
  })

  process.on('uncaughtException', (error) => {
    logger.fatal(error, 'Uncaught exception')
    process.exit(1)
  })
}
