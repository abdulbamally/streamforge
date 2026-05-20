import Redis from "ioredis";
import { config } from "../utils/config";

const PRESENCE_PREFIX = "sf:presence:stream:";
const TTL_SEC = 7200;

let client: Redis | null = null;

function getClient() {
  if (!client) {
    client = new Redis(config.REDIS_URL, { maxRetriesPerRequest: 2 });
  }
  return client;
}

export async function presenceJoin(streamId: string, userId: string) {
  const key = `${PRESENCE_PREFIX}${streamId}`;
  const r = getClient();
  await r.sadd(key, userId);
  await r.expire(key, TTL_SEC);
  return r.scard(key);
}

export async function presenceLeave(streamId: string, userId: string) {
  const key = `${PRESENCE_PREFIX}${streamId}`;
  const r = getClient();
  await r.srem(key, userId);
  return r.scard(key);
}
