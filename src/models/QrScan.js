import mongoose from "mongoose";

const qrScanSchema = new mongoose.Schema(
  {
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    qrData: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("QrScan", qrScanSchema);
