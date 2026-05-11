import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { registerRoutes } from "./routes";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(fastifyCors, { origin: "*" });
  app.register(websocket);
  registerRoutes(app);

  return app;
}
