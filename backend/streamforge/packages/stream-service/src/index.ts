// ============================================================
//  StreamForge — Stream Service Entry Point
//  Boots: Fastify API + RTMP server + WebSocket server
// ============================================================
import "dotenv/config";

import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyJwt from "@fastify/jwt";
import fastifyWs from "@fastify/websocket";
import fastifyRateLimit from "@fastify/rate-limit";

import { config } from "./utils/config";
import { logger } from "./utils/logger";
import { prisma } from "./utils/prisma";
import { redis } from "./utils/redis";
import { RtmpServer } from "./rtmp/rtmp.server";
import { MulticastService } from "./services/multicast.service";
import { RecordingService } from "./services/recording.service";
import { SceneService } from "./services/scene.service";
import { StatsService } from "./services/stats.service";
import { streamRoutes } from "./routes/stream.routes";
import { registerWebSocket } from "./websocket/ws.server";

async function bootstrap() {
  // ── Instantiate services (manual DI) ──────────────────────
  const multicast = new MulticastService();
  const recording = new RecordingService();
  const sceneService = new SceneService();
  const statsService = new StatsService();

  // ── Fastify app ───────────────────────────────────────────
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

  // ── Plugins ───────────────────────────────────────────────
  await app.register(fastifyHelmet, { contentSecurityPolicy: false });

  await app.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

  await app.register(fastifyJwt, {
    secret: config.INTERNAL_SERVICE_SECRET, // Shared with auth service
  });

  await app.register(fastifyRateLimit, {
    global: true,
    max: 200,
    timeWindow: 60000,
    redis,
  });

  await app.register(fastifyWs);

  // ── WebSocket ─────────────────────────────────────────────
  registerWebSocket(app);

  // ── HTTP Routes ───────────────────────────────────────────
  await app.register(
    async (api) => {
      await api.register(
        (router: any) => streamRoutes(router, { multicast, sceneService }),
        { prefix: "/streams" },
      );
    },
    { prefix: "/api/v1" },
  );

  // ── Health ────────────────────────────────────────────────
  app.get("/health", { logLevel: "warn" }, async () => ({
    status: "ok",
    service: "stream-service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  // ── Global error handler ──────────────────────────────────
  app.setErrorHandler((error, _request, reply) => {
    logger.error(error);
    return reply.status(error.statusCode ?? 500).send({
      success: false,
      error: {
        code: error.code ?? "SRV_001",
        message:
          config.NODE_ENV === "production" && !error.statusCode
            ? "Internal error"
            : error.message,
      },
    });
  });

  // ── Start Fastify ─────────────────────────────────────────
  try {
    await app.listen({ port: config.PORT, host: config.HOST });
    logger.info(`🚀 Stream Service API on port ${config.PORT}`);
  } catch (err) {
    logger.fatal(err, "Failed to start stream service");
    process.exit(1);
  }

  // ── Start RTMP Server ─────────────────────────────────────
  const rtmp = new RtmpServer(multicast, recording);
  rtmp.start();

  // ── Graceful shutdown ─────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} — shutting down stream service`);
    await app.close();
    rtmp.stop();
    await prisma.$disconnect();
    await redis.quit();
    logger.info("Stream service shut down");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled rejection");
  });
}

bootstrap();
