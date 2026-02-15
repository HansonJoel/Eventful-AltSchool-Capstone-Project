import Redis from "ioredis";
import { ENV } from "./env.js";

export const redisClient = new Redis({
  host: ENV.REDIS_HOST || "127.0.0.1",
  port: ENV.REDIS_PORT ? Number(ENV.REDIS_PORT) : 6379,
  ...(ENV.REDIS_PASSWORD ? { password: ENV.REDIS_PASSWORD } : {}),
  retryStrategy: (times) => {
    // Exponential backoff, max 30s
    const delay = Math.min(times * 50, 30000);
    return delay;
  },
});

redisClient.on("connect", () => {
  console.log("Redis connected");
});

redisClient.on("ready", () => {
  console.log("Redis ready to use");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redisClient.on("close", () => {
  console.warn("Redis connection closed");
});
