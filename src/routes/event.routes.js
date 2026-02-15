import express from "express";
import * as eventController from "../controllers/event.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Creator-only: Get my created events
router.get(
  "/creator/me",
  protect("creator"),
  eventController.getEventsByCreator,
);

// Create event (Creator only)
router.post("/", protect("creator"), eventController.createEvent);

// ✅ NEW: Get events the user has applied for
router.get("/applied", protect("eventee"), eventController.getAppliedEvents);

// View all events (Authenticated users)
router.get("/", protect(), eventController.getAllEvents);

// Get event by ID
router.get("/:id", protect(), eventController.getEventById);

// Apply for event
router.post(
  "/:id/apply",
  protect(["eventee", "creator"]),
  eventController.applyForEvent,
);

export default router;
