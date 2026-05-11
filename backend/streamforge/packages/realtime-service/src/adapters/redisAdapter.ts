export function createRedisAdapter() {
  return {
    publish: (channel: string, payload: unknown) => {
      console.log(`[redis-adapter] publish ${channel}`, payload);
    },
  };
}
