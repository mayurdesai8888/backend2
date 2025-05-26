import express from "express";
import authMiddleware from "../middleware/auth_middleware.js";
import {
  UpcomingServices,
  UpcomingInsuranceDue,
  UpcomingPUCDue,
  UpcomingACServiceDue,
  UpcomingBatteryServiceDue,
  UpcomingTyreServiceDue,
} from "../controller/crm_controller.js";

const router = express.Router();

router.get("/upcoming-services", authMiddleware, UpcomingServices);
router.get("/upcoming-insurance-due", authMiddleware, UpcomingInsuranceDue);
router.get("/upcoming-puc-due", authMiddleware, UpcomingPUCDue);
router.get("/upcoming-ac-service-due", authMiddleware, UpcomingACServiceDue);
router.get("/upcoming-tyre-service-due",authMiddleware,UpcomingTyreServiceDue);
router.get("/upcoming-battery-service-due",authMiddleware,UpcomingBatteryServiceDue);

export default router;