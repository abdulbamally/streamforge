import "dotenv/config";
import { buildApp } from "./app";
import { startCrossInstanceRelay, stopCrossInstanceRelay } from "./relay";
import { config } from "./utils/config";
import { prisma } from "./utils/prisma";

const PORT = config.PORT;

async function start() {
  const app = await buildApp();
  await app.ready();
  await startCrossInstanceRelay(app);

  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    app.log.info(`realtime-service listening on ${PORT}`);
  } catch (error) {
    app.log.error(error);
    await stopCrossInstanceRelay();
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  }

  const shutdown = async () => {
    await app.close();
    await stopCrossInstanceRelay();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start();
