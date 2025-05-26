import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Client from "../models/auth_model.js";

dotenv.config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Extract the actual token
  const sessionId = req.header("Session-Id"); // Get session ID from request headers

  if (!sessionId) {
    return res.status(401).json({ message: "Session ID required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user from DB using phone from token
    const user = await Client.findOne({ phone: decoded.phone });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if session ID is valid
    const validSession = user.sessions.some((session) => session.sessionId === sessionId);
    if (!validSession) {
      return res.status(403).json({ message: "Invalid session. Please log in again." });
    }

    // Attach full user info to req.user (including _id)
    req.user = {
      _id: user._id,
      phone: user.phone,
      role: user.role,
      sessionId: sessionId,

      isPlanActive: user.isPlanActive,
      // boostPlan: user.boostPlan,
      planId: user?.planId,
      planExpire: user?.planExpire,
      jobCards: user?.jobCards,
      invoices: user?.invoices,
      AllTopUp: user?.AllTopUp,
      credit: user?.credit,
      planName: user?.planName,

    };

    // console.log("Authenticated USER:", user);

    next(); // Proceed to the next middleware
  } catch (error) {
    console.error("JWT Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired. Please log in again." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token." });
    }

    res.status(500).json({ message: "Internal server error during authentication." });
  }
};

export default authMiddleware;
