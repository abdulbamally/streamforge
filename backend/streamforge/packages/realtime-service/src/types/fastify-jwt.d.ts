import type { AccessTokenUser } from "./access-token-user";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AccessTokenUser;
    user: AccessTokenUser;
  }
}
