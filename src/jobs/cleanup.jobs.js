import cron from "node-cron";

export const startCleanupJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("🧹 Cleanup job running");
  });

  console.log("✅ Cleanup cron job scheduled");
};
