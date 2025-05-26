import express from "express";
import {
  sendMediaTemplate,
  sendMessage,
  sendMessageReceivedStatus,
  sendPaymentReminder,
} from "../controller/whatApp_controller.js";
import authMiddleware from "../middleware/auth_middleware.js";

const router = express.Router();



router.post("/send-message", authMiddleware, sendMessage);

router.post("/send-message-success", sendMessageReceivedStatus);

router.post("/send-media-template", authMiddleware, sendMediaTemplate);

router.post("/send-payment-reminder", sendPaymentReminder);

export default router;
