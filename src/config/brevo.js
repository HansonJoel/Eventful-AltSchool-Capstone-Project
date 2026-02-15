import nodemailer from "nodemailer";
import { ENV } from "./env.js";

export const emailTransporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // TLS false for 587
  auth: {
    user: "apikey",
    pass: ENV.BREVO_API_KEY,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await emailTransporter.sendMail({
      from: `Eventful <${ENV.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log(
      `✅ Email sent to ${to} | Subject: "${subject}" | MessageId: ${info.messageId}`,
    );
    return { success: true, info };
  } catch (error) {
    console.error(
      `Email sending error to ${to} | Subject: "${subject}" | Error: ${error.message}`,
    );
    return { success: false, error: error.message };
  }
};
