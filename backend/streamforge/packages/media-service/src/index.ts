// ============================================================
//  StreamForge — Media Service Entry Point
// ============================================================
import "dotenv/config";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import IORedis from "ioredis";

import { config } from "./utils/config";
import { logger } from "./utils/logger";
import { prisma } from "./utils/prisma";
import { mediaRoutes, projectRoutes } from "./routes/media.routes";
import { closeWorkers } from "./workers";

async function bootstrap() {
  const redis = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: 3 });

  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport:
        config.NODE_ENV === "development"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
    trustProxy: true,
    bodyLimit: 1 * 1024 * 1024, // 1MB JSON limit (uploads use presigned URLs)
  });

  await app.register(fastifyHelmet, { contentSecurityPolicy: false });
  await app.register(fastifyCors, { origin: true, credentials: true });
  await app.register(fastifyJwt, { secret: config.JWT_ACCESS_SECRET });
  await app.register(fastifyMultipart, {
    limits: { fileSize: 100 * 1024 * 1024 },
  }); // 100MB
  await app.register(fastifyRateLimit, {
    global: true,
    max: 200,
    timeWindow: 60000,
    redis,
  });

  // Routes
  await app.register(
    async (api) => {
      await api.register(mediaRoutes, { prefix: "/media" });
      await api.register(projectRoutes, { prefix: "/projects" });
    },
    { prefix: "/api/v1" },
  );

  app.get("/health", { logLevel: "warn" }, async () => ({
    status: "ok",
    service: "media-service",
    timestamp: new Date().toISOString(),
  }));

  app.setErrorHandler((error, _req, reply) => {
    logger.error(error);
    return reply.status(error.statusCode ?? 500).send({
      success: false,
      error: { code: error.code ?? "SRV_001", message: error.message },
    });
  });

  try {
    await app.listen({ port: config.PORT, host: config.HOST });
    logger.info(`🚀 Media Service running on port ${config.PORT}`);
  } catch (err) {
    logger.fatal(err, "Failed to start media service");
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    logger.info(`${signal} — shutting down media service`);
    await app.close();
    await closeWorkers();
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap();
