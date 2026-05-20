import Redis from "ioredis";
import { config } from "../utils/config";

const CHANNEL_PREFIX = "sf:rt:stream:";

export function streamChannel(streamId: string) {
  return `${CHANNEL_PREFIX}${streamId}`;
}

function createPair() {
  const publisher = new Redis(config.REDIS_URL, { maxRetriesPerRequest: 2 });
  const subscriber = new Redis(config.REDIS_URL, { maxRetriesPerRequest: 2 });
  return { publisher, subscriber };
}

let pair: ReturnType<typeof createPair> | null = null;

export function getRedisBus() {
  if (!pair) {
    pair = createPair();
  }
  const { publisher, subscriber } = pair;
  return {
    streamChannel,
    async publish(streamId: string, message: string) {
      await publisher.publish(streamChannel(streamId), message);
    },
    async subscribe(
      onMessage: (streamId: string, raw: string) => void,
    ): Promise<void> {
      await subscriber.psubscribe(`${CHANNEL_PREFIX}*`);
      subscriber.on("pmessage", (_pattern, channel, message) => {
        const streamId = channel.slice(CHANNEL_PREFIX.length);
        const raw = Buffer.isBuffer(message)
          ? message.toString("utf8")
          : String(message);
        onMessage(streamId, raw);
      });
    },
    async shutdown() {
      await publisher.quit();
      await subscriber.quit();
      pair = null;
    },
  };
}
