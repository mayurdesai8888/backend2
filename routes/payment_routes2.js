import express from "express";
import {
  allTransaction,
  checkout,
  paymentVerification,
  paymentfailed,
  paymentCancel,
} from "../controller/payment2_controller.js";
import  authMiddleware  from "../middleware/auth_middleware.js";
const router = express.Router();

router.post("/checkout",authMiddleware,  checkout);
router.post("/paymentverification",  paymentVerification);
router.post("/paymentfailed",  paymentfailed);
router.post("/paymentcancel", authMiddleware, paymentCancel);
router.post("/alltransaction", authMiddleware, allTransaction);

export default router;
