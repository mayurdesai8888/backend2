import express from "express";
import authMiddleware from "../middleware/auth_middleware.js";
import {
  getAllBoostPlan,
  getSingleBoostPlanDetail,
  getAllTopUpPlan,
  getSingleTopUpPlanDetail,
} from "../controller/allPlan_controller.js";


const router = express.Router();

router.post("/all_boostplan", authMiddleware, getAllBoostPlan);

router.post("/get_singleboostplan", authMiddleware, getSingleBoostPlanDetail);


router.post("/all_topupplan", authMiddleware, getAllTopUpPlan);

router.post("/get_singletopupplan", authMiddleware, getSingleTopUpPlanDetail);

export default router;
