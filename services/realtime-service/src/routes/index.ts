import type { FastifyInstance } from "fastify";
import { chatRoutes } from "../modules/chat/chat.routes";
import { presenceRoutes } from "../modules/presence/presence.routes";
import { socketRoute } from "./socket.routes";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    success: true,
    data: { service: "realtime-service", status: "ok" },
  }));

  await app.register(
    async (v1) => {
      await v1.register(chatRoutes, { prefix: "/chat" });
      await v1.register(presenceRoutes, { prefix: "/presence" });
      await v1.register(socketRoute, { prefix: "/rt" });
    },
    { prefix: "/api/v1" },
  );
}
