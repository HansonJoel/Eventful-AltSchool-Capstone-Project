import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    price: { type: Number, default: 0, min: 0 }, // no negative price
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Event", eventSchema);
