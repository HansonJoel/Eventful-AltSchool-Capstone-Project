import * as analyticsService from "../services/analytics.service.js";

export const getCreatorAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getCreatorAnalytics(req.user.id);
    res.status(200).json({ success: true, result: analytics });
  } catch (error) {
    next(error);
  }
};

export const getEventeeAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getEventeeAnalytics(req.user.id);
    res.status(200).json({ success: true, result: analytics });
  } catch (error) {
    next(error);
  }
};
