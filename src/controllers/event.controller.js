import * as eventService from "../services/event.service.js";

// ... keep existing createEvent, getAllEvents, etc.
export const getAppliedEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAppliedEvents(req.user.id);
    res.status(200).json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent({
      ...req.body,
      creator: req.user.id,
    });
    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents();
    res.status(200).json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

export const getEventsByCreator = async (req, res, next) => {
  try {
    const events = await eventService.getEventsByCreator(req.user.id);
    res.status(200).json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

export const applyForEvent = async (req, res, next) => {
  try {
    const event = await eventService.applyForEvent(req.params.id, req.user.id);
    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};
