import * as notificationService from "../services/notification.service.js";

export const createNotification = async (req, res, next) => {
  try {
    const { eventId, remindAt, type } = req.body;
    const notification = await notificationService.createNotification({
      eventId,
      userId: req.user.id,
      remindAt: new Date(remindAt),
      type,
    });
    res.status(201).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(
      req.user.id,
    );
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};
