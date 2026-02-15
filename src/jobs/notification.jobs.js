import { redisClient } from "../config/redis.js";
import { sendEmail } from "../config/brevo.js";
import Notification from "../models/Notification.js";

export const startNotificationJob = () => {
  setInterval(async () => {
    try {
      // Example: send unsent notifications
      const notifications = await Notification.find({ sent: false });

      for (let note of notifications) {
        const result = await sendEmail({
          to: note.userEmail,
          subject: "New Event Notification",
          html: `<p>${note.message}</p>`,
        });

        if (result.success) {
          note.sent = true;
          await note.save();
        }
      }
    } catch (err) {
      console.error("Notification job error:", err);
    }
  }, 30_000); // every 30 seconds
};
