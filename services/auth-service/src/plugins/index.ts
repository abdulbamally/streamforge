// ============================================================
//  Plugin Registration
// ============================================================

import type { FastifyInstance } from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyJwt from '@fastify/jwt'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { config } from '../utils/config'
import { redis } from '../utils/redis'

export async function registerPlugins(app: FastifyInstance): Promise<void> {

  // ─── Security Headers ────────────────────────────────────
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: config.NODE_ENV === 'production',
  })

  // ─── CORS ────────────────────────────────────────────────
  await app.register(fastifyCors, {
    origin:
      config.NODE_ENV === 'development'
        ? true
        : [config.FRONTEND_URL, config.APP_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining'],
  })

  // ─── Cookies ─────────────────────────────────────────────
  await app.register(fastifyCookie, {
    secret: config.COOKIE_SECRET,
    hook: 'onRequest',
    parseOptions: {
      httpOnly: true,
      secure: config.COOKIE_SECURE,
      sameSite: 'strict',
      domain: config.COOKIE_DOMAIN,
      path: '/',
    },
  })

  // ─── JWT ─────────────────────────────────────────────────
  await app.register(fastifyJwt, {
    secret: {
      private: config.JWT_ACCESS_SECRET,
      public:  config.JWT_ACCESS_SECRET,
    },
    sign: { expiresIn: config.JWT_ACCESS_EXPIRES_IN },
  })

  // ─── Rate Limiting ───────────────────────────────────────
  await app.register(fastifyRateLimit, {
    global: true,
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW_MS,
    redis,
    keyGenerator: (request) =>
      request.headers['x-forwarded-for'] as string ||
      request.ip,
    errorResponseBuilder: (_request, context) => ({
      success: false,
      error: {
        code: 'SRV_003',
        message: `Rate limit exceeded. Try again in ${Math.ceil(context.ttl / 1000)} seconds.`,
      },
    }),
  })

  // ─── Swagger (dev only) ──────────────────────────────────
  if (config.NODE_ENV !== 'production') {
    await app.register(fastifySwagger, {
      openapi: {
        openapi: '3.1.0',
        info: {
          title: 'StreamForge Auth API',
          description: 'Authentication & user management for StreamForge',
          version: '1.0.0',
        },
        servers: [{ url: config.API_URL }],
        components: {
          securitySchemes: {
            BearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [{ BearerAuth: [] }],
        tags: [
          { name: 'Auth',         description: 'Authentication endpoints' },
          { name: 'Users',        description: 'User management' },
          { name: 'Subscription', description: 'Billing & subscriptions' },
        ],
      },
    })

    await app.register(fastifySwaggerUi, {
      routePrefix: '/docs',
      uiConfig: { deepLinking: true, docExpansion: 'list' },
    })
  }

  // ─── Request ID decoration ──────────────────────────────
  app.addHook('onRequest', async (request, reply) => {
    const requestId = request.id as string
    reply.header('X-Request-ID', requestId)
  })

  // ─── Global error handler ───────────────────────────────
  app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode ?? 500

    if (statusCode >= 500) {
      request.log.error({ err: error }, 'Internal server error')
    }

    return reply.status(statusCode).send({
      success: false,
      error: {
        code:    error.code ?? 'SRV_001',
        message: statusCode >= 500 && config.NODE_ENV === 'production'
          ? 'An internal error occurred'
          : error.message,
      },
    })
  })

  // ─── 404 handler ─────────────────────────────────────────
  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      success: false,
      error: {
        code:    'SRV_002',
        message: `Route ${request.method} ${request.url} not found`,
      },
    })
  })
}
