import { RazorpayInstance } from "../server.js";
import crypto from "crypto";
import Payment from "../models/payment_model.js";
import Client from "../models/auth_model.js";
import mongoose from "mongoose";
import UserEvents from "../models/userEvent_model.js";


const BOOSTPLAN = {
  basicPlan: {
    price: 300,
    credit: 50,
    loginSession: 2,
  },
  ProPlan: {
    price: 900,
    credit: 100,
    loginSession: 3,
  },
  UltimatePlan: {
    price: 1200,
    credit: 200,
    loginSession: 7,
  },
};

const planCheckbasedOnPrice=(price)=>{
  if(price===30000){
return 'basicPlan'
  }else  if (price === 90000) {
    return "ProPlan";
  } else if (price === 120000) {
    return "UltimatePlan";
  }

}

export const checkout = async (req, res) => {
  try {
    const { boostPlan } = req.body;
    const plan = BOOSTPLAN[boostPlan];

    if (!plan) {
      return res.status(400).json({ message: "Invalid boostPlan selected" });
    }

    const options = {
      amount: plan.price * 100, // Razorpay needs amount in paise
      currency: "INR",
    };

    const order = await RazorpayInstance.orders.create(options);

    await Payment.create({
      user: req.user._id,
      razorpay_order_id: order.id,
      currency: order.currency,
      plan: boostPlan,
      amount: order.amount,
      status: "pending",
    });

    // Update user event status
    await UserEvents.updateOne(
      { clientId: req.user._id },
      { $set: { status: "paymentClick" } }
    );

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    return res.status(500).json({
      message: "Server error during checkout",
      error: error.message,
    });
  }
};


export const paymentVerificationOld = async (req, res) => {
  const {
    razorpay_order_id,
   razorpay_payment_id,
    razorpay_signature,
    boostPlan,
  } = req.body;
 
  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !boostPlan
  ) {
    return res.status(400).json({ message: "Missing or invalid fields" });
  }
console.log("razorpay_payment_id",razorpay_payment_id);
   const plan = BOOSTPLAN[boostPlan];
   if (!plan) {
     return res.status(400).json({ message: "Invalid boostPlan selected" });
   }


  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res
      .status(400)
      .json({ success: false, message: "Payment verification failed" });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    await Client.findByIdAndUpdate(
      req.user._id,
      {
         $inc: { credit: plan.credit },
        $set: { boostPlan, loginSession: plan.loginSession },
      },
      { session }
    );
  
    await Payment.updateOne(
      {
        razorpay_order_id: razorpay_order_id,
        user: req.user._id,
      },
      {
        razorpay_paymentId: razorpay_payment_id,
        razorpay_signature,
        status: "success",
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Transaction error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment failed",
    });
  }
};
export const paymentVerification = async (req, res) => {
  console.log("***************payment-start***********************");
  console.log("Payment Verification Payload: ", req.body);
  console.log("****************payment-end**********************");

  const secretKey = process.env.RAZORPAY_WEBHOOK_SECRETKEY;

  const shasum = crypto.createHmac("sha256", secretKey);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest !== req.headers["x-razorpay-signature"]) {
    console.log("Digest does not match x-razorpay-signature");
    return res.status(400).json({ message: "Invalid signature" });
  }

  console.log("Request is legit");

  const razorpay_order_id = req.body.payload.payment.entity.order_id;
  const razorpay_payment_id = req.body.payload.payment.entity.id;
  const amount = req.body.payload.payment.entity.amount;
  const boostPlan = planCheckbasedOnPrice(amount);
  const plan = BOOSTPLAN[boostPlan];

  if (!plan) {
    return res.status(400).json({ message: "Unknown plan for payment amount" });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const mypayment = await Payment.findOne({ razorpay_order_id }).session(
      session
    );
    if (!mypayment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json({ message: "Invalid order ID" });
    }

    await Client.findByIdAndUpdate(
      mypayment.user,
      {
        $inc: { credit: plan.credit },
        $set: { boostPlan, loginSession: plan.loginSession },
      },
      { session }
    );

    await Payment.updateOne(
      { razorpay_order_id },
      {
        $set: {
          razorpay_paymentId: razorpay_payment_id,
          status: "success",
        },
      },
      { session }
    );

    await UserEvents.deleteOne({ clientId: mypayment.user }, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


export const oldpaymentfailed = async (req, res) => {

  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({ message: "Order ID is required." });
  }

  try {
    const result = await Payment.updateOne(
      {
        razorpay_order_id: order_id,
        user: req.user._id,
      },
      {
        $set: { status: "failed" },
      }
    );

    console.log("Update result:", result);
    console.log("Order ID:", order_id);
    console.log("**********************************");

    return res.status(200).json({ message: "Failed payment logged." });
  } catch (err) {
    console.error("Log failed payment error:", err);
    return res.status(500).json({
      message: "Error logging failed payment",
      error: err.message,
    });
  }
};






export const paymentfailed = async (req, res) => {
  console.log("***************failed-start***********************");
  console.log("Payment failed Payload: ", req.body);
  console.log("****************failed-end**********************");

  const secretKey = process.env.RAZORPAY_WEBHOOK_SECRETKEY;
  const shasum = crypto.createHmac("sha256", secretKey);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest !== req.headers["x-razorpay-signature"]) {
    return res.status(200).json({ message: "Invalid signature" });
  }

  console.log("Request is legit");

  const razorpay_order_id = req.body.payload.payment.entity.order_id;
  const razorpay_payment_id = req.body.payload.payment.entity.id;

  try {
    const mypayment = await Payment.findOne({ razorpay_order_id });
    if (!mypayment) {
      return res
        .status(200)
        .json({ message: "No payment record found for failed payment." });
    }

    await Payment.updateOne(
      { razorpay_order_id },
      {
        $push: {
          otherTranscation: {
            razorpay_paymentId: razorpay_payment_id,
          },
        },
      }
    );
// 
 let user= await Client.findOne({ _id:mypayment.user})

// boostplan none or expire
if (!user.boostPlan || user.boostPlan === "None") {
  await UserEvents.updateOne(
    { clientId: user._id },
    {
      $set: {
        status: "paymentfailed",
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
}

   

    console.log("Payment failure logged.");
    return res.status(200).json({ message: "Failed payment logged." });
  } catch (error) {
    console.error("Error updating payment record:", error);
    return res.status(200).json({
      message: "Error updating payment failure record",
      error: error.message,
    });
  }
};


export const allTransaction = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id });
    const user = await Client.findById(req.user._id);

    return res.status(200).json({ payments, user });
  } catch (err) {
    console.error("Transaction fetch error:", err);
    return res.status(500).json({
      message: "Error fetching transactions",
      error: err.message,
    });
  }
};

export const delTransaction = async (req, res) => {
  try {
    const payments = await Payment.deleteMany();

    return res.status(200).json({ payments });
  } catch (err) {
    console.error("Transaction fetch error:", err);
    return res.status(500).json({
      message: "Error fetching transactions",
      error: err.message,
    });
  }
};
