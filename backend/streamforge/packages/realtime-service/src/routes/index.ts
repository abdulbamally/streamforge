import { FastifyInstance } from "fastify";
import { chatRoutes } from "../modules/chat/chat.routes";
import { presenceRoutes } from "../modules/presence/presence.routes";
import { socketRoute } from "./socket.routes";

export function registerRoutes(app: FastifyInstance) {
  app.get("/", async () => ({ service: "realtime-service", status: "ok" }));
  app.register(chatRoutes, { prefix: "/chat" });
  app.register(presenceRoutes, { prefix: "/presence" });
  app.register(socketRoute, { prefix: "/socket" });
}
