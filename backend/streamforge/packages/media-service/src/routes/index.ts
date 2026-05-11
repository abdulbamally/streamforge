// ============================================================
//  Media Service — Route Registration
// ============================================================

import type { FastifyInstance } from 'fastify'
import { mediaRoutes, projectRoutes } from './media.routes'

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await app.register(
    async (api) => {
      await api.register(mediaRoutes,   { prefix: '/media' })
      await api.register(projectRoutes, { prefix: '/projects' })
    },
    { prefix: '/api/v1' }
  )
}
