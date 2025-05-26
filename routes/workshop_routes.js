import express from "express";
import {
  createWorkshop,
  updateWorkshop,
  viewWorkshopProfile,
} from "../controller/workshop_controller.js";
import authMiddleware from "../middleware/auth_middleware.js";

const router = express.Router();

router.post("/createWorkshop", authMiddleware, createWorkshop);
router.put("/updateWorkshop", authMiddleware, updateWorkshop);
router.get("/viewWorkshop", authMiddleware, viewWorkshopProfile);

export default router;
