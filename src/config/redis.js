import Redis from "ioredis";
import { ENV } from "./env.js";

let redisClient;

// Production: Use REDIS_URL (Handles Upstash SSL/TLS automatically)
if (ENV.REDIS_URL) {
  console.log("⚡ Using REDIS_URL for connection");
  redisClient = new Redis(ENV.REDIS_URL, {
    retryStrategy: (times) => Math.min(times * 50, 30000),
  });
}
// Development: Use Host/Port (Localhost)
else {
  console.log("Using Host/Port for connection");
  redisClient = new Redis({
    host: ENV.REDIS_HOST || "127.0.0.1",
    port: ENV.REDIS_PORT ? Number(ENV.REDIS_PORT) : 6379,
    ...(ENV.REDIS_PASSWORD ? { password: ENV.REDIS_PASSWORD } : {}),
    retryStrategy: (times) => Math.min(times * 50, 30000),
  });
}

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

export { redisClient };
