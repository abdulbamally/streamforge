import type { FastifyReply, FastifyRequest } from "fastify";
import type { AccessTokenUser } from "../types/access-token-user";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify<AccessTokenUser>();
  } catch {
    return reply.status(401).send({
      success: false,
      error: {
        code: "AUTH_004",
        message: "Invalid or missing access token",
      },
    });
  }
}
