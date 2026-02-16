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
  // 1. Fetch Event to get the REAL price (Security Fix)
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  const priceInNaira = event.price; // e.g., 0, 240, 5000

  // FREE EVENT (Bypass Paystack)
  if (priceInNaira === 0) {
    const reference = `FREE-${crypto.randomUUID()}`; // Internal reference

    // 1. Generate QR Code immediately
    const qrPayload = `EVENT-${eventId}-USER-${user._id}-REF-${reference}`;
    const qrImage = await generateQRCode(qrPayload);

    // 2. Create the Ticket immediately
    const ticket = await Ticket.create({
      event: eventId,
      user: user._id,
      amount: 0,
      ticketCode: crypto.randomBytes(8).toString("hex").toUpperCase(),
      paymentReference: reference,
      paymentStatus: "completed", // Free events are always "completed"
      qrCode: qrImage,
    });

    // 3. Update Event Attendees
    await Event.findByIdAndUpdate(eventId, {
      $addToSet: { attendees: user._id },
    });

    // 4. Send Email
    await sendEmail({
      to: user.email,
      subject: "🎫 Free Ticket Confirmation",
      html: `<p>Hi ${user.name},</p>
             <p>You have successfully registered for the free event: <strong>${event.title}</strong>!</p>
             <p>Ticket Code: <strong>${ticket.ticketCode}</strong></p>`,
    });

    // 5. Return a special "Free" response
    return {
      free: true,
      ticket,
      message: "Registration successful",
    };
  }

  // 1. Convert Naira to Kobo here
  const amountInKobo = priceInNaira * 100;
  const reference = crypto.randomUUID();

  // 2. Send Kobo to Paystack Config
  const paystackResponse = await initializePaystackPayment({
    email: user.email,
    amount: amountInKobo, // Sends 24000
    reference,
    callback_url: `${ENV.FRONTEND_URL}/payment-success.html?eventId=${eventId}`,
  });

  // 3. Record the transaction in Naira (Store 240)
  const payment = await Payment.create({
    user: user._id,
    event: eventId,
    reference,
    amount: priceInNaira,
    status: "pending",
    provider: "paystack",
  });

  return {
    free: false,
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

  // If already verified, return existing ticket
  if (payment.status === "success" && payment.ticket) {
    const existingTicket = await Ticket.findById(payment.ticket);
    return { ticket: existingTicket, verification: payment.meta };
  }

  // Verify with Paystack
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
