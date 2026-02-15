import express from "express";
import { redisClient } from "../config/redis.js";
import Notification from "../models/Notification.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", protect(), async (req, res) => {
  try {
    const userId = req.user._id;

    const cached = await redisClient.get(`notifications:${userId}`);
    if (cached) {
      return res.json({ success: true, result: JSON.parse(cached) });
    }

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    await redisClient.setex(
      `notifications:${userId}`,
      60,
      JSON.stringify(notifications),
    );

    res.json({ success: true, result: notifications });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
});

export default router;
