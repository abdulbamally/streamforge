import type { FastifyRequest, FastifyReply } from 'fastify'
import type { JwtAccessPayload } from '@streamforge/shared/types'

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const payload = await request.jwtVerify<JwtAccessPayload>()
    request.user  = payload
  } catch {
    return reply.status(401).send({ success: false, error: { code: 'AUTH_004', message: 'Invalid token' } })
  }
}
