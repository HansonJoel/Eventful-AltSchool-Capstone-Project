import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,

  REDIS_URL: process.env.REDIS_URL,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  FROM_EMAIL: process.env.FROM_EMAIL,

  BASE_URL: process.env.BASE_URL || "http://localhost:5000",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5000",
};
