import "dotenv/config";
import { buildApp } from "./app";
import { config } from "./utils/config";
import { prisma } from "./utils/prisma";

const PORT = config.PORT;

async function start() {
  const app = await buildApp();
  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    app.log.info(`monetization-service listening on ${PORT}`);
  } catch (error) {
    app.log.error(error);
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  }

  const shutdown = async () => {
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start();
