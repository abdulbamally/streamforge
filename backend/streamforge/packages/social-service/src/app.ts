import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { registerRoutes } from "./routes";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(fastifyCors, {
    origin: "*",
  });

  registerRoutes(app);

  return app;
}
