import express from "express";
import authMiddleware from "../middleware/auth_middleware.js";

import {
  saveJob,
  getJobById,
  getAllJobs,
  updatePayment,
  getAllPendingPayments,
  searchVehicle,
} from "../controller/job_controller.js";
const router = express.Router();


router.post("/savejob", authMiddleware, saveJob);
router.get("/getJob/:jobId", authMiddleware, getJobById);
router.get("/getAllJobs", authMiddleware, getAllJobs);
router.put("/update-payment/:jobId", authMiddleware, updatePayment);
router.get("/pending-payments", authMiddleware, getAllPendingPayments);
router.get("/searchVehicle", authMiddleware, searchVehicle);

export default router;
