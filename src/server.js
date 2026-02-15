import app from "./app.js";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";
import { redisClient } from "./config/redis.js";

import { startNotificationJob } from "./jobs/notification.jobs.js";
import { startCleanupJob } from "./jobs/cleanup.jobs.js";

const startServer = async () => {
  try {
    // 1️⃣ Connect MongoDB
    await connectDB();

    // 2️⃣ Redis auto-connects (ioredis)
    console.log("Redis client initialized");

    // 3️⃣ Start Express server
    app.listen(ENV.PORT, () => {
      console.log(`Server running at http://localhost:${ENV.PORT}`);

      // 4️⃣ Start cron jobs AFTER server boots
      startNotificationJob();
      startCleanupJob();
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
