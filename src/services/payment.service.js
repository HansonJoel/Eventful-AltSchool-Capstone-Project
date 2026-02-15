import crypto from "crypto";
import Payment from "../models/payment.js";
import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import { initializePaystackPayment } from "../config/paystack.js";
import { sendEmail } from "../config/brevo.js";
import { ENV } from "../config/env.js";
import { generateQRCode } from "./qr.service.js";

/* ---------------- INITIALIZE PAYMENT ---------------- */
export const initializePaymentService = async ({ user, eventId, amount }) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  if (!amount || amount <= 0) throw new Error("Invalid payment amount");

  const reference = crypto.randomUUID();

  const paystackResponse = await initializePaystackPayment({
    email: user.email,
    amount,
    reference,
    callback_url: `${ENV.FRONTEND_URL}/payment-success.html?eventId=${eventId}`,
  });

  const payment = await Payment.create({
    user: user._id,
    event: eventId,
    reference,
    amount,
    status: "pending",
    provider: "paystack",
  });

  return {
    payment,
    transaction: {
      authorization_url: paystackResponse.data.authorization_url,
      reference,
    },
  };
};

/* ---------------- VERIFY PAYMENT ---------------- */
export const verifyPaymentService = async ({ user, reference, eventId }) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  const payment = await Payment.findOne({ reference, user: user._id });
  if (!payment) throw new Error("Payment record not found");

  if (payment.status === "success" && payment.ticket) {
    const existingTicket = await Ticket.findById(payment.ticket);
    return { ticket: existingTicket, verification: payment.meta };
  }

  const paystackResult = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: { Authorization: `Bearer ${ENV.PAYSTACK_SECRET_KEY}` },
    },
  ).then((res) => res.json());

  if (!paystackResult.data || paystackResult.data.status !== "success") {
    payment.status = "failed";
    await payment.save();
    throw new Error("Payment verification failed");
  }

  payment.status = "success";
  payment.meta = paystackResult.data;

  const qrPayload = `EVENT-${eventId}-USER-${user._id}-REF-${reference}`;
  const qrImage = await generateQRCode(qrPayload);

  const ticket = await Ticket.create({
    event: eventId,
    user: user._id,
    amount: payment.amount,
    ticketCode: crypto.randomBytes(8).toString("hex").toUpperCase(),
    paymentReference: reference,
    paymentStatus: "completed",
    qrCode: qrImage,
  });

  payment.ticket = ticket._id;
  await payment.save();

  // $addToSet prevents duplicates
  await Event.findByIdAndUpdate(eventId, {
    $addToSet: { attendees: user._id },
  });

  await sendEmail({
    to: user.email,
    subject: "🎫 Ticket Purchase Successful",
    html: `<p>Hi ${user.name},</p>
           <p>Your ticket for <strong>${event.title}</strong> has been successfully purchased!</p>
           <p>Ticket Code: <strong>${ticket.ticketCode}</strong></p>`,
  });

  return { ticket, verification: paystackResult.data };
};
