export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3006,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
};
