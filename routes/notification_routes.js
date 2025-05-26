import express from "express";

import authMiddleware from "../middleware/auth_middleware.js";
import {
  userCheckedNotification,
  sendNotificationToPlanUser,
  sendNotificationToUser,
  sendNotificationToAll,
} from "../controller/notification_controller.js";

const router = express.Router();

router.post("/send-to-all", sendNotificationToAll);
router.post("/send-to-user", sendNotificationToUser);
//router.post("/send-to-planuser", sendNotificationToPlanUser);
router.post(
  "/user-check-notification",
  authMiddleware,
  userCheckedNotification);

  // router.post(
  //   "/user-notification",
  //   authMiddleware,
  //   userCheckedNotification
  // );

// router.post("/logout", authMiddleware, logout);
// router.put("/update-profile", authMiddleware, updateProfile);
// router.get("/view-profile", authMiddleware, viewProfile);

export default router;
