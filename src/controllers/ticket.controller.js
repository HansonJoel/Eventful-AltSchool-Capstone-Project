import * as ticketService from "../services/ticket.service.js";
import Event from "../models/Event.js";

// Eventee: Purchase a ticket
export const purchaseTicket = async (req, res, next) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res
        .status(400)
        .json({ success: false, message: "Event ID is required" });
    }

    // Ensure event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const ticket = await ticketService.createTicket({
      eventId,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

/**
 * Eventee: Get my tickets (with event info)
 */
export const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await ticketService.getTicketsByUser(req.user.id);

    // Populate event info
    const populatedTickets = await Event.populate(tickets, { path: "event" });

    res.status(200).json({ success: true, tickets: populatedTickets });
  } catch (error) {
    next(error);
  }
};

/**
 * Creator: Get tickets for a specific event
 */
export const getTicketsForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Ensure event exists and belongs to creator
    const event = await Event.findOne({ _id: eventId, creator: req.user.id });
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found or unauthorized" });
    }

    const tickets = await ticketService.getTicketsByEvent(eventId);

    // Populate event info
    const populatedTickets = await Event.populate(tickets, { path: "event" });

    res.status(200).json({ success: true, tickets: populatedTickets });
  } catch (error) {
    next(error);
  }
};

/**
 * Creator: Validate a ticket
 */
export const validateTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    const ticket = await ticketService.validateTicket(ticketId);

    // Ensure the ticket's event belongs to the creator
    const event = await Event.findOne({
      _id: ticket.event,
      creator: req.user.id,
    });
    if (!event) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot validate this ticket",
      });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};
