import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import User from "../models/User.js";

/**
 * Middleware to verify JWT and attach user to req
 */
export const authenticate = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token missing" });
    }

    // Verify token
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    // Fetch full user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    // ✅ Log the specific error for debugging
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Not authorized",
      error: error.message, // Return exact error to frontend for debugging
    });
  }
};

/**
 * Middleware to restrict access based on role
 */
export const protect = (roles = []) => {
  if (typeof roles === "string") roles = [roles];

  return [
    authenticate, // Always run authenticate first
    (req, res, next) => {
      if (roles.length && !roles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ success: false, message: "Forbidden: Access denied" });
      }
      next();
    },
  ];
};
