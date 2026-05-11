import type { FastifyInstance } from 'fastify'
import { aiRoutes } from './ai.routes'

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await app.register(
    async (api) => { await api.register(aiRoutes, { prefix: '/ai' }) },
    { prefix: '/api/v1' }
  )
}
