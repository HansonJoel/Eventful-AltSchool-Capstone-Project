import express from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/creator",
  protect("creator"),
  analyticsController.getCreatorAnalytics,
);
router.get(
  "/eventee",
  protect("eventee"),
  analyticsController.getEventeeAnalytics,
);

export default router;
