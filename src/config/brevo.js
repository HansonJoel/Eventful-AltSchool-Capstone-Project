import nodemailer from "nodemailer";
import { ENV } from "./env.js";

export const emailTransporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 2525, // Keep this, it is working!
  secure: false,
  auth: {
    // FIX: Use the variable we just added, NOT "apikey"
    user: ENV.BREVO_USER,
    // ENSURE: This is the SMTP Key (starts with xsmtp-), not the API Key
    pass: ENV.BREVO_API_KEY,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await emailTransporter.sendMail({
      from: `Eventful <${ENV.FROM_EMAIL || ENV.BREVO_USER}>`, // Ensure 'from' is valid
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to} | MsgId: ${info.messageId}`);
    return { success: true, info };
  } catch (error) {
    console.error(
      `Email sending error to ${to} | Subject: "${subject}" | Error: ${error.message}`,
    );
    return { success: false, error: error.message };
  }
};
