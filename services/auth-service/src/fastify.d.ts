import type { JwtAccessPayload, JwtRefreshPayload } from '@streamforge/shared/types'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtAccessPayload | JwtRefreshPayload
    user: JwtAccessPayload
  }
}

declare module 'fastify' {
  interface FastifyContextConfig {
    rawBody?: boolean
  }
}
