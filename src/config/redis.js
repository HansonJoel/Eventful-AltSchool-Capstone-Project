import Redis from "ioredis";
import { ENV } from "./env.js";

let redisClient;

if (ENV.REDIS_URL) {
  console.log("Using REDIS_URL for connection");
  redisClient = new Redis(ENV.REDIS_URL);
} else {
  console.log("Using Secure Host/Port connection (Upstash Mode)");
  redisClient = new Redis({
    host: ENV.REDIS_HOST,
    port: ENV.REDIS_PORT ? Number(ENV.REDIS_PORT) : 6379,
    password: ENV.REDIS_PASSWORD,
    username: "default", // Upstash always uses 'default'
    tls: {},
    retryStrategy: (times) => Math.min(times * 50, 30000),
  });
}

redisClient.on("connect", () => console.log("Redis connected"));
redisClient.on("ready", () => console.log("Redis ready to use"));
redisClient.on("error", (err) => console.error("Redis connection error:", err));

export { redisClient };
