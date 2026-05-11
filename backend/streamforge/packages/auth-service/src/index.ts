// ============================================================
//  StreamForge Auth Service — Entry Point
// ============================================================
import "dotenv/config";

import Fastify from "fastify";
import { registerPlugins } from "./plugins";
import { registerRoutes } from "./routes";
import { config } from "./utils/config";
import { logger } from "./utils/logger";
import { gracefulShutdown } from "./utils/shutdown";
import { prisma } from "./utils/prisma";
import { redis } from "./utils/redis";

async function bootstrap() {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport:
        config.NODE_ENV === "development"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
    trustProxy: true, // Behind Nginx / Kong
    ajv: {
      customOptions: {
        removeAdditional: "all", // Strip unknown fields
        coerceTypes: "array",
        useDefaults: true,
      },
    },
    genReqId: () => crypto.randomUUID(),
  });

  // ─── Register all plugins ──────────────────────────────────
  await registerPlugins(app);

  // ─── Register all routes ───────────────────────────────────
  await registerRoutes(app);

  // ─── Health check (before auth middleware) ─────────────────
  app.get("/health", { logLevel: "warn" }, async () => ({
    status: "ok",
    service: "auth-service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  // ─── Start server ──────────────────────────────────────────
  try {
    await app.listen({ port: config.PORT, host: config.HOST });
    logger.info(`🚀 Auth Service listening on ${config.HOST}:${config.PORT}`);
    logger.info(`📋 Swagger docs at http://${config.HOST}:${config.PORT}/docs`);
  } catch (err) {
    logger.error("Failed to start server");
    process.exit(1);
  }

  // ─── Graceful shutdown ─────────────────────────────────────
  gracefulShutdown(app, [
    () => prisma.$disconnect(),
    async () => {
      await redis.quit();
    },
  ]);

  return app;
}

bootstrap();
