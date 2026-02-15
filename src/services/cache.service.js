import { redisClient } from "../config/redis.js";

const DEFAULT_EXPIRATION = 60 * 5; // 5 minutes

export const setCache = async (key, value, expiration = DEFAULT_EXPIRATION) => {
  try {
    await redisClient.set(key, JSON.stringify(value), "EX", expiration);
  } catch (error) {
    console.error("Redis set error:", error);
  }
};

export const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
};

export const delCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(" Redis delete error:", error);
  }
};
