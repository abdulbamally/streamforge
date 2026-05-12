import type { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import { config } from "../utils/config";

export async function registerPlugins(app: FastifyInstance): Promise<void> {
  await app.register(fastifyCors, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  await app.register(fastifyJwt, {
    secret: {
      private: config.JWT_ACCESS_SECRET,
      public: config.JWT_ACCESS_SECRET,
    },
  });

  app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode ?? 500;
    if (statusCode >= 500) {
      request.log.error({ err: error }, "monetization-service error");
    }
    return reply.status(statusCode).send({
      success: false,
      error: {
        code: (error as { code?: string }).code ?? "SRV_001",
        message:
          statusCode >= 500 && config.NODE_ENV === "production"
            ? "An internal error occurred"
            : error.message,
      },
    });
  });
}
