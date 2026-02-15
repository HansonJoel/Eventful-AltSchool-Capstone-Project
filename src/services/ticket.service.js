import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import { generateQRCode } from "./qr.service.js";

/**
 * Create a new ticket for an event
 */
export const createTicket = async ({ eventId, userId }) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  // Prevent duplicate tickets
  const existingTicket = await Ticket.findOne({ event: eventId, user: userId });
  if (existingTicket) throw new Error("Ticket already purchased");

  // Generate QR code with ticket info
  const qrString = `${eventId}-${userId}-${Date.now()}`;
  const qrCode = await generateQRCode(qrString);

  const ticket = new Ticket({
    event: eventId,
    user: userId,
    qrCode,
    paymentStatus: "completed",
    amount: event.price, // Ensure amount is saved
    ticketCode: `TKT-${Date.now()}`, // Generate a simple ticket code
  });

  await ticket.save();

  // Populate the event for frontend display
  await ticket.populate("event", "title description date location price");

  return ticket;
};

/**
 * Get all tickets for a user (populate event)
 */
export const getTicketsByUser = async (userId) => {
  const tickets = await Ticket.find({ user: userId })
    .populate("event", "title description date location price")
    .sort({ createdAt: -1 }); // Show newest first
  return tickets;
};

/**
 * Get all tickets for a specific event (populate user)
 */
export const getTicketsByEvent = async (eventId) => {
  const tickets = await Ticket.find({ event: eventId }).populate(
    "user",
    "name email",
  );
  return tickets;
};

/**
 * Validate ticket (mark as used)
 */
export const validateTicket = async (ticketId) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new Error("Ticket not found");

  if (ticket.status === "used") throw new Error("Ticket already used");

  ticket.status = "used";
  ticket.checkedInAt = new Date();
  await ticket.save();

  return ticket;
};
