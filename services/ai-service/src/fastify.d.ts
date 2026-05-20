import type { JwtAccessPayload } from '@streamforge/shared/types'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtAccessPayload
    user: JwtAccessPayload
  }
}
