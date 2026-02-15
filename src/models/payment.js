import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Optional: Only exists after successful payment
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
    },

    // Track which event this payment is for
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    // Paystack transaction reference
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Amount in NAIRA (₦)
    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "NGN",
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    provider: {
      type: String,
      default: "paystack",
    },

    meta: {
      type: Object,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Payment", paymentSchema);
