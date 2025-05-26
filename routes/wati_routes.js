import express from "express";
const router = express.Router();
import {
  sendWhatsAppMessage,
  sendWhatsAppReceived,
  sendMediaTemplate,
  sendPaymentReminder,
} from "../controller/wati_controller.js";

router.post("/sendMsg", sendWhatsAppMessage);
router.post("/receiveMsg", sendWhatsAppReceived);
router.post("/sendDoc", sendMediaTemplate);
router.post("/sendReminder", sendPaymentReminder);

export default router;
