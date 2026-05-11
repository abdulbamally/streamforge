import { buildApp } from "./app";

const PORT = Number(process.env.PORT || 3005);

async function start() {
  const app = buildApp();
  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    app.log.info(`social-service listening on ${PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
