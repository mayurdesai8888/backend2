import express from "express";
import {
  sendMessage,
  sendMessageReceivedStatus,
  getAllCreditHistory,
  getSingleCreditHistory,
} from "../controller/creditHistory_controller.js";
import authMiddleware from "../middleware/auth_middleware.js";

const router = express.Router();

;


router.post("/get-all-credit-history", authMiddleware, getAllCreditHistory);
router.post("/get-credit-history", authMiddleware, getSingleCreditHistory);


router.post("/send-message", authMiddleware, sendMessage);

router.post("/send-message-success", sendMessageReceivedStatus);
;


export default router;
