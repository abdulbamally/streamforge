import type { JwtAccessPayload } from './types/index'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtAccessPayload
    user: JwtAccessPayload
  }
}

declare module 'fastify' {
  interface FastifyContextConfig {
    rawBody?: boolean
  }
}
