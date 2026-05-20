import type { FastifyInstance } from 'fastify'
import { logger } from './logger'

type CleanupFn = () => Promise<void> | void

export function gracefulShutdown(app: FastifyInstance, cleanupFns: CleanupFn[] = []): void {
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down AI service`)
    await app.close()
    await Promise.allSettled(cleanupFns.map(fn => fn()))
    logger.info('AI service shut down cleanly')
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))
  process.on('unhandledRejection', (reason) => logger.error({ reason }, 'Unhandled rejection'))
  process.on('uncaughtException',  (error)  => { logger.fatal(error, 'Uncaught exception'); process.exit(1) })
}
