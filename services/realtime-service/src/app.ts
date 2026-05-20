import Fastify from "fastify";
import { registerPlugins } from "./plugins/register";
import { registerRoutes } from "./routes";

export async function buildApp() {
  const app = Fastify({ logger: true, requestIdHeader: "x-request-id" });
  await registerPlugins(app);
  await registerRoutes(app);
  return app;
}
