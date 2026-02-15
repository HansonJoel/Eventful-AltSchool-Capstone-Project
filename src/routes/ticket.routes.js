import express from "express";
import * as ticketController from "../controllers/ticket.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Allow creators to buy tickets
router.post(
  "/purchase",
  protect(["eventee", "creator"]),
  ticketController.purchaseTicket,
);

// Allow creators to see tickets they bought
router.get(
  "/me",
  protect(["eventee", "creator"]),
  ticketController.getMyTickets,
);

// These stay 'creator' only (Managing events)
router.get(
  "/event/:eventId",
  protect("creator"),
  ticketController.getTicketsForEvent,
);

router.put(
  "/validate/:ticketId",
  protect("creator"),
  ticketController.validateTicket,
);

export default router;
