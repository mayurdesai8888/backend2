import express from "express";
import {
  allTransaction,
  checkout,
  paymentVerification,
  paymentfailed,
  delTransaction,
} from "../controller/payment_controller.js";
import  authMiddleware  from "../middleware/auth_middleware.js";
const router = express.Router();

router.post("/checkout",authMiddleware,  checkout);

// router.post("/paymentverification", authMiddleware, paymentVerificationOld);
//router.post("/oldpaymentfailed", authMiddleware, paymentfailed);
 
router.post("/paymentverification",  paymentVerification);
router.post("/paymentfailed",  paymentfailed);
router.post("/alltransaction", authMiddleware, allTransaction);
router.post("/delete",authMiddleware,  delTransaction);
;
// router.post("/payme", paymentVerification);
export default router;
