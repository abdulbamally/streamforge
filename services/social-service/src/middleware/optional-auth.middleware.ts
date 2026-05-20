import type { FastifyReply, FastifyRequest } from "fastify";
import type { AccessTokenUser } from "../types/access-token-user";

export async function optionalAuthenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const auth = request.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return;
  }
  try {
    await request.jwtVerify<AccessTokenUser>();
  } catch {
    /* guest */
  }
}
