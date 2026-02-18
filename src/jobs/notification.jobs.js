import Notification from "../models/Notification.js";
import { sendEmail } from "../config/brevo.js";

export const startNotificationJob = () => {
  // Run every 5 minutes to check for pending reminders
  setInterval(async () => {
    try {
      const now = new Date();
      // Find notifications where the scheduled time has passed and they haven't been sent
      const pendingReminders = await Notification.find({
        remindAt: { $lte: now },
        status: "pending",
      }).populate("user event");

      for (let reminder of pendingReminders) {
        const userEmail = reminder.user?.email || reminder.userEmail;
        const eventTitle = reminder.event?.title || "an upcoming event";

        const result = await sendEmail({
          to: userEmail,
          subject: `Reminder: ${eventTitle} is coming up!`,
          html: `<p>Hello, this is your reminder for <strong>${eventTitle}</strong>.</p>
                 <p>${reminder.message}</p>`,
        });

        if (result.success) {
          reminder.status = "sent";
          reminder.sent = true;
          await reminder.save();
        }
      }
    } catch (err) {
      console.error("Scheduled Notification Job Error:", err);
    }
  }, 300_000); // 5 minutes
};
