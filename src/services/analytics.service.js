import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";

export const getCreatorAnalytics = async (creatorId) => {
  const events = await Event.find({ creator: creatorId }).lean();
  const analytics = [];
  let totalRevenueAll = 0;

  for (const event of events) {
    const totalTickets = await Ticket.countDocuments({ event: event._id });
    const qrScanned = await Ticket.countDocuments({
      event: event._id,
      status: "used",
    });

    const ticketsSold = await Ticket.find({
      event: event._id,
      paymentStatus: "completed",
    });

    const revenue = ticketsSold.reduce((acc, ticket) => acc + ticket.amount, 0);
    totalRevenueAll += revenue;

    analytics.push({
      eventId: event._id,
      title: event.title,
      date: event.date,
      totalTickets,
      qrScanned,
      attendees: event.attendees ? event.attendees.length : 0,
      revenue,
    });
  }

  return {
    events: analytics,
    summary: {
      totalTicketsAll: analytics.reduce((acc, e) => acc + e.totalTickets, 0),
      qrScannedAll: analytics.reduce((acc, e) => acc + e.qrScanned, 0),
      totalAttendeesAll: analytics.reduce((acc, e) => acc + e.attendees, 0),
      totalRevenueAll,
    },
  };
};

export const getEventeeAnalytics = async (userId) => {
  const tickets = await Ticket.find({
    user: userId,
    paymentStatus: "completed",
  })
    .populate("event", "title date location price")
    .lean();

  const eventsAnalytics = tickets.map((ticket) => ({
    eventId: ticket.event?._id,
    title: ticket.event?.title || "Unknown Event",
    date: ticket.event?.date,
    ticketCode: ticket.ticketCode,
    amountSpent: ticket.amount,
  }));

  const totalSpent = tickets.reduce((acc, t) => acc + t.amount, 0);

  return {
    events: eventsAnalytics,
    summary: {
      totalEventsAttended: tickets.length,
      totalSpent,
    },
  };
};
