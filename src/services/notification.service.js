import Notification from "../models/Notification.js";
import Event from "../models/Event.js";
import { sendEmail } from "../config/brevo.js";

export const createNotification = async ({
  eventId,
  userId,
  remindAt,
  type,
}) => {
  const notification = new Notification({
    event: eventId,
    user: userId,
    remindAt,
    type,
  });
  await notification.save();
  return notification;
};

export const getUserNotifications = async (userId) => {
  return await Notification.find({ user: userId }).populate("event");
};

// Send reminders for notifications that are due
export const sendDueNotifications = async () => {
  const now = new Date();
  const notifications = await Notification.find({
    sent: false,
    remindAt: { $lte: now },
  })
    .populate("user")
    .populate("event");

  for (const notification of notifications) {
    const { user, event } = notification;

    const emailHtml = `
      <h3>Reminder: ${event.title}</h3>
      <p>Hello ${user.name},</p>
      <p>This is a reminder for the event you subscribed to:</p>
      <p><strong>${event.title}</strong> at ${event.location} on ${event.date.toDateString()} ${event.time}</p>
      <p>See you there!</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Event Reminder",
        html: emailHtml,
      });
      notification.sent = true;
      await notification.save();
      console.log(`📧 Reminder sent to ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to send reminder to ${user.email}`, error);
    }
  }
};
