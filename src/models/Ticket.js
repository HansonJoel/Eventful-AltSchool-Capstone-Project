import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Stable unique ticket identifier (used for QR generation)
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Base64 string or QR payload
    qrCode: {
      type: String,
    },

    // Payment details
    amount: {
      type: Number, // amount in NAIRA (₦)
      required: true,
    },

    currency: {
      type: String,
      default: "NGN",
    },

    paymentReference: {
      type: String,
      unique: true,
      sparse: true, // allows pending tickets without ref
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    // Ticket usage status
    status: {
      type: String,
      enum: ["unused", "used"],
      default: "unused",
    },

    checkedInAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Ticket", ticketSchema);
