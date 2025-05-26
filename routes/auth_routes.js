import express from "express";
import {
  sendOTP,
  updateProfile,
  logout,
  verifyOTP,
  viewProfile,
} from "../controller/auth_controller.js";
import authMiddleware from "../middleware/auth_middleware.js";

const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

router.get("/view-profile", authMiddleware, viewProfile);
router.put("/updateProfile", authMiddleware, updateProfile);

router.post("/logout", authMiddleware, logout);

export default router;
