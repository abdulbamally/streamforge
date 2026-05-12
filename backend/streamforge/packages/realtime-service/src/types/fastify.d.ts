import type { AccessTokenUser } from "./access-token-user";

declare module "fastify" {
  interface FastifyRequest {
    user: AccessTokenUser;
  }
}
