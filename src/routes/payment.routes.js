import express from "express";
import * as paymentController from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ✅ UPDATE: Allow creators to test payments too
router.post(
  "/initialize",
  protect(["eventee", "creator"]),
  paymentController.initializePayment,
);

// ✅ UPDATE: Allow creators to verify payments
router.post(
  "/verify",
  protect(["eventee", "creator"]),
  paymentController.verifyPayment,
);

export default router;
