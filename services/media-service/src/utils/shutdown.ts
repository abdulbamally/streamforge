// ============================================================
//  Media Service — Graceful Shutdown
// ============================================================

import type { FastifyInstance } from 'fastify'
import { logger } from './logger'

type CleanupFn = () => Promise<void> | void

export function gracefulShutdown(
  app:        FastifyInstance,
  cleanupFns: CleanupFn[] = []
): void {
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down media service`)

    await app.close()

    await Promise.allSettled(cleanupFns.map(fn => fn()))

    logger.info('✅ Media service shut down cleanly')
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection')
  })

  process.on('uncaughtException', (error) => {
    logger.fatal(error, 'Uncaught exception')
    process.exit(1)
  })
}
