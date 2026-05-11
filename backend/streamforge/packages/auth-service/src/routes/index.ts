// ============================================================
//  Route Registration
// ============================================================

import type { FastifyInstance } from 'fastify'
import { authRoutes }         from './auth.routes'
import { userRoutes }         from './user.routes'
import { subscriptionRoutes } from './subscription.routes'
import { internalRoutes }     from './internal.routes'

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // All public + authenticated routes are versioned
  await app.register(
    async (api) => {
      await api.register(authRoutes,         { prefix: '/auth' })
      await api.register(userRoutes,         { prefix: '/users' })
      await api.register(subscriptionRoutes, { prefix: '/subscriptions' })
    },
    { prefix: '/api/v1' }
  )

  // Internal service-to-service routes (not versioned, IP-restricted in prod)
  await app.register(internalRoutes, { prefix: '/api/internal' })
}
