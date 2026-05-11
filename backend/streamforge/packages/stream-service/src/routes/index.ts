// ============================================================
//  Stream Service — Route Registration
// ============================================================

import type { FastifyInstance } from 'fastify'
import { streamRoutes }   from './stream.routes'
import { MulticastService } from '../services/multicast.service'
import { SceneService }     from '../services/scene.service'

export async function registerRoutes(
  app:       FastifyInstance,
  multicast: MulticastService,
  sceneService: SceneService
): Promise<void> {
  await app.register(
    async (api) => {
      await api.register(
        (router: any) => streamRoutes(router, { multicast, sceneService }),
        { prefix: '/streams' }
      )
    },
    { prefix: '/api/v1' }
  )
}
