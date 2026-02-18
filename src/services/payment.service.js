import crypto from "crypto";
import Payment from "../models/payment.js";
import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import { initializePaystackPayment } from "../config/paystack.js";
import { sendEmail } from "../config/brevo.js";
import { ENV } from "../config/env.js";
import { generateQRCode } from "./qr.service.js";

/* ---------------- INITIALIZE PAYMENT (Handles Paid & Free) ---------------- */
export const initializePaymentService = async ({ user, eventId }) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  const priceInNaira = event.price;

  if (priceInNaira === 0) {
    const reference = `FREE-${crypto.randomUUID()}`;
    const qrPayload = `EVENT-${eventId}-USER-${user._id}-REF-${reference}`;
    const qrImage = await generateQRCode(qrPayload);

    const ticket = await Ticket.create({
      event: eventId,
      user: user._id,
      amount: 0,
      ticketCode: crypto.randomBytes(8).toString("hex").toUpperCase(),
      paymentReference: reference,
      paymentStatus: "completed",
      qrCode: qrImage,
    });

    await ticket.populate("event", "title date location");

    await Event.findByIdAndUpdate(eventId, {
      $addToSet: { attendees: user._id },
    });

    sendEmail({
      to: user.email,
      subject: "🎫 Free Ticket Confirmation",
      html: `<p>Hi ${user.name},</p>
             <p>You have successfully registered for the free event: <strong>${event.title}</strong>!</p>
             <p>Ticket Code: <strong>${ticket.ticketCode}</strong></p>`,
    }).catch((err) =>
      console.error("⚠️ Free Ticket Email Failed:", err.message),
    );

    return { free: true, ticket, message: "Registration successful" };
  }

  const amountInKobo = priceInNaira * 100;
  const reference = crypto.randomUUID();

  const paystackResponse = await initializePaystackPayment({
    email: user.email,
    amount: amountInKobo,
    reference,
    callback_url: `${ENV.FRONTEND_URL}/payment-success.html?eventId=${eventId}`,
  });

  await Payment.create({
    user: user._id,
    event: eventId,
    reference,
    amount: priceInNaira,
    status: "pending",
    provider: "paystack",
  });

  return {
    free: false,
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
    const existingTicket = await Ticket.findById(payment.ticket).populate(
      "event",
      "title",
    );
    return { ticket: existingTicket, verification: payment.meta };
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: { Authorization: `Bearer ${ENV.PAYSTACK_SECRET_KEY}` },
    },
  );

  const paystackResult = await response.json();

  if (!paystackResult.status || paystackResult.data.status !== "success") {
    payment.status = "failed";
    await payment.save();
    throw new Error("Payment verification failed");
  }

  payment.status = "success";
  payment.meta = paystackResult.data;

  const qrPayload = `TICKET-${crypto.randomBytes(4).toString("hex")}-EVENT-${eventId}`;
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

  await ticket.populate("event", "title date location");

  payment.ticket = ticket._id;
  await payment.save();

  await Event.findByIdAndUpdate(eventId, {
    $addToSet: { attendees: user._id },
  });

  sendEmail({
    to: user.email,
    subject: "🎫 Ticket Purchase Successful",
    html: `<p>Hi ${user.name},</p>
           <p>Your ticket for <strong>${event.title}</strong> has been successfully purchased!</p>
           <p>Ticket Code: <strong>${ticket.ticketCode}</strong></p>`,
  }).catch((err) => console.error("⚠️ Background Email Failed:", err.message));

  return { ticket, verification: paystackResult.data };
};
