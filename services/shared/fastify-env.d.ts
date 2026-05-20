import type { JwtAccessPayload } from './types'

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
