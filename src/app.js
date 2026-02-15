import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// Custom middlewares
import { rateLimiter } from "./middlewares/rateLimiter.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ---------------- GLOBAL MIDDLEWARE ---------------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ✅ Static files (Serve these freely)
app.use(express.static(path.join(__dirname, "../public")));

/* ---------------- API ROUTES---------------- */
app.use("/api", rateLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);

/* ---------------- DEFAULT ROUTE ---------------- */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

/* ---------------- ERROR HANDLER (LAST) ---------------- */
app.use(errorMiddleware);

export default app;
