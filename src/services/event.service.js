import Event from "../models/Event.js";
import { getCache, setCache, delCache } from "./cache.service.js";

/**
 * Create a new event
 * Invalidates cached event lists AND creator analytics
 */
export const createEvent = async ({
  title,
  description,
  location,
  date,
  time,
  price,
  creator,
}) => {
  // Prevent past dates
  const chosenDate = new Date(date);
  const today = new Date();

  // Reset time to midnight for both to compare only the date part
  chosenDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (chosenDate < today) {
    throw new Error(
      "Event date cannot be in the past. Please choose a valid future date.",
    );
  }

  const event = new Event({
    title,
    description,
    location,
    date,
    time,
    price,
    creator,
  });

  await event.save();

  // Invalidate Public Cache
  await delCache("events:all");

  // Invalidate Creator Dashboard Cache
  await delCache(`analytics:${creator}`);

  return event;
};

/**
 * Get all events (with Redis caching)
 */
export const getAllEvents = async () => {
  const cacheKey = "events:all";

  const cachedEvents = await getCache(cacheKey);
  if (cachedEvents) {
    console.log("⚡ Events fetched from cache");
    return cachedEvents;
  }

  const events = await Event.find().populate("creator", "name email").lean();

  await setCache(cacheKey, events, 300);

  return events;
};

/**
 * Get event by ID (with Redis caching)
 */
export const getEventById = async (id) => {
  const cacheKey = `events:${id}`;

  const cachedEvent = await getCache(cacheKey);
  if (cachedEvent) {
    console.log("⚡ Event fetched from cache");
    return cachedEvent;
  }

  const event = await Event.findById(id)
    .populate("creator", "name email")
    .lean();

  if (!event) {
    throw new Error("Event not found");
  }

  await setCache(cacheKey, event, 300);

  return event;
};

/**
 * Get events created by a specific user
 */
export const getEventsByCreator = async (creatorId) => {
  return await Event.find({ creator: creatorId }).populate(
    "attendees",
    "name email",
  );
};

export const getAppliedEvents = async (userId) => {
  return await Event.find({ attendees: userId }).populate("creator", "name");
};

export const applyForEvent = async (eventId, userId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  // Ensure attendees is an array
  if (!Array.isArray(event.attendees)) {
    event.attendees = [];
  }

  if (event.attendees.includes(userId)) {
    throw new Error("Already applied to this event");
  }

  event.attendees.push(userId);
  await event.save();

  await delCache(`events:${eventId}`);

  await delCache(`analytics:${event.creator}`);

  return event;
};
