// ============================================================
//  AI Service — Fastify Plugin Registration
// ============================================================

import type { FastifyInstance } from 'fastify'
import fastifyCors      from '@fastify/cors'
import fastifyHelmet    from '@fastify/helmet'
import fastifyJwt       from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifySwagger   from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { redis }   from '../utils/redis'
import { config }  from '../utils/config'

export async function registerPlugins(app: FastifyInstance): Promise<void> {

  await app.register(fastifyHelmet, { contentSecurityPolicy: false })

  await app.register(fastifyCors, {
    origin:      true,
    credentials: true,
    methods:     ['GET', 'POST', 'OPTIONS'],
  })

  await app.register(fastifyJwt, { secret: config.JWT_ACCESS_SECRET })

  await app.register(fastifyMultipart, {
    limits: { fileSize: 20 * 1024 * 1024 },  // 20MB max image
  })

  await app.register(fastifyRateLimit, {
    global:      true,
    max:         500,
    timeWindow:  60000,
    redis,
    keyGenerator: (req) => req.headers['x-forwarded-for'] as string || req.ip,
    errorResponseBuilder: (_req, ctx) => ({
      success: false,
      error: { code: 'SRV_003', message: `Rate limit exceeded. Retry in ${Math.ceil(ctx.ttl / 1000)}s` },
    }),
  })

  if (config.NODE_ENV !== 'production') {
    await app.register(fastifySwagger, {
      openapi: {
        openapi: '3.1.0',
        info: { title: 'StreamForge AI API', version: '1.0.0' },
        tags: [
          { name: 'Detection',    description: 'Object & face detection' },
          { name: 'OCR',         description: 'Text extraction from images/frames' },
          { name: 'Translation', description: 'Real-time text translation' },
          { name: 'Scene',       description: 'AI scene description' },
        ],
        components: {
          securitySchemes: {
            BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          },
        },
      },
    })
    await app.register(fastifySwaggerUi, { routePrefix: '/docs' })
  }

  app.addHook('onRequest', async (_req, reply) => {
    reply.header('X-Request-ID', crypto.randomUUID())
  })

  app.setErrorHandler((error, request, reply) => {
    const status = error.statusCode ?? 500
    if (status >= 500) request.log.error({ err: error }, 'Internal error')
    return reply.status(status).send({
      success: false,
      error: {
        code:    error.code ?? 'SRV_001',
        message: status >= 500 && config.NODE_ENV === 'production'
          ? 'Internal server error'
          : error.message,
      },
    })
  })

  app.setNotFoundHandler((_req, reply) =>
    reply.status(404).send({ success: false, error: { code: 'SRV_002', message: 'Route not found' } })
  )
}
