// ============================================================
//  StreamForge AI Service — Entry Point
// ============================================================
import "dotenv/config";
import Fastify from "fastify";
import { config } from "./utils/config";
import { logger } from "./utils/logger";
import { redis } from "./utils/redis";
import { registerPlugins } from "./plugins";
import { registerRoutes } from "./routes";
import { gracefulShutdown } from "./utils/shutdown";
import { closeAiWorkers } from "./workers";

async function bootstrap() {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport:
        config.NODE_ENV === "development"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
    trustProxy: true,
  });

  await registerPlugins(app);
  await registerRoutes(app);

  app.get("/health", { logLevel: "warn" }, async () => ({
    status: "ok",
    service: "ai-service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  try {
    await app.listen({ port: config.PORT, host: config.HOST });
    logger.info(`🤖 AI Service running on port ${config.PORT}`);
    logger.info(`📋 Swagger docs at http://${config.HOST}:${config.PORT}/docs`);
  } catch (err) {
    logger.fatal(err, "Failed to start AI service");
    process.exit(1);
  }

  gracefulShutdown(app, [
    async () => {
      await redis.quit();
    },
    () => closeAiWorkers(),
  ]);
}

bootstrap();
