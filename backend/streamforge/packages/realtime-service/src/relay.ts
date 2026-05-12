import type { FastifyInstance } from "fastify";
import { broadcastLocal } from "./ws/room-registry";
import { getRedisBus } from "./redis/bus";

let relayStarted = false;

export async function startCrossInstanceRelay(_app: FastifyInstance) {
  if (relayStarted) return;
  const bus = getRedisBus();
  await bus.subscribe((streamId, raw) => {
    broadcastLocal(streamId, raw);
  });
  relayStarted = true;
}

export async function stopCrossInstanceRelay() {
  if (!relayStarted) return;
  relayStarted = false;
  await getRedisBus().shutdown();
}
