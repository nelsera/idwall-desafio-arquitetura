import { createClient } from "redis";

export const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST ?? "redis"}:${process.env.REDIS_PORT ?? "6379"}`,
});

redisClient.on("error", (error) => {
  console.error("Redis error:", error);
});

export async function connectRedis(): Promise<void> {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}