import { RazorpayInstance } from "../server.js";
import crypto from "crypto";
import Payment from "../models/payment_model.js";
import Client from "../models/auth_model.js";

import UserEvents from "../models/userEvent_model.js";

import BoostPlan from "../models/boostPlan_model.js";
import TopUp from "../models/topUp_model.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

// const BOOSTPLAN = {
//   basicPlan: {
//     price: 300,
//     credit: 50,
//     loginSession: 2,
//   },
//   ProPlan: {
//     price: 900,
//     credit: 100,
//     loginSession: 3,
//   },
//   UltimatePlan: {
//     price: 1200,
//     credit: 200,
//     loginSession: 7,
//   },
// };
// const TOPUPPLAN = {
//   minPlan: {
//     price: 300,
//     credit: 50,
//     validity: 360,
//   },
//   microPlan: {
//     price: 900,
//     credit: 100,
//     validity: 360,
//   },
//   stdPlan: {
//     price: 1200,
//     credit: 200,
//     validity: 360,
//   },
// };

// const planCheckbasedOnPrice=(price)=>{
//   if(price===30000){
// return 'basicPlan'
//   }else  if (price === 90000) {
//     return "ProPlan";
//   } else if (price === 120000) {
//     return "UltimatePlan";
//   }

// }
// for boostplan and topUp

export const checkout = async (req, res) => {
  try {
    const { planID,type } = req.body;
    let plan;
    if (type === "BoostPlan") {
      plan = await BoostPlan.findById(planID);
      //create a condition if user plan expire date vality high compare to given plan
    } else if (type === "TopUp") {
      plan = await TopUp.findById(planID);
    } else {
      return res
        .status(400)
        .json({ message: "Type parameter should be BOOSTPLAN or TOPUP" });
    }
    // const plan = BOOSTPLAN[boostPlan];

    if (!plan) {
      return res.status(400).json({ message: "Invalid boostPlan selected" });
    }

    const options = {
      amount: plan.price * 100, // Razorpay needs amount in paise
      currency: "INR",
    };

    const order = await RazorpayInstance.orders.create(options);


    // 
    await Payment.create({
      user: req.user._id,
      razorpay_order_id: order.id,
      currency: order.currency,
      planId: planID, 
      planTypeRef: type,
      planName: plan.name,
      amount: order.amount, //in paise
      status: "pending",
    });




    if (!req.user.isPlanActive) {

     let userEvent = await UserEvents.findOne({
       clientId: req.user._id,
     });  
console.log("hello world1")
if (!userEvent){
  console.log("hello world2");
  await UserEvents.create({
    clientId: req.user._id,
    status: "paymentClick",
  });  
};
if (userEvent?.status == "paymentClick") {
  await UserEvents.updateOne({
    clientId: req.user._id,},
{createdAt: Date.now() }
  );  
}
    }
  
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

export const paymentVerification = async (req, res) => {
  try{
  console.log("***************payment-start***********************");
  console.log(
    "Payment Verification Payload: ",
    req.body.payload.payment.entity
  );
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

  const mypayment = await Payment.findOne({ razorpay_order_id });
  let method = req.body.payload.payment.entity.method;
  await Payment.updateOne(
    { razorpay_order_id },
    {
      $set: {
        method:method,
        razorpay_paymentId: razorpay_payment_id,
        status: "success",
      },
    }
  );

  
  let plan;
  if (mypayment.planTypeRef === "BoostPlan") {
    plan = await BoostPlan.findById(mypayment.planId);


    
    await Client.findByIdAndUpdate(mypayment.user, {
      $inc: { credit: plan.credit },
      $set: {
        isPlanActive: true,
        loginSession: plan.loginSession,
        planId: plan._id,
        planName: plan.name,
        invoices: plan.invoices,
        jobCards: plan.jobCards,
        loginLimit: plan.loginLimit,
        planExpire: new Date(Date.now() + plan.validity * 24 * 60 * 60 * 1000),
        loginSession: plan.additionDetail,
      },
    });

    await UserEvents.deleteOne({ clientId: mypayment.user });

  } else if (mypayment.planTypeRef === "TopUp") {
    console.log("payment ref topupplan");
    plan = await TopUp.findById(mypayment.planId);
    await Client.findByIdAndUpdate(mypayment.user, {
      $push: {
        AllTopUp: {
          planId: plan._id,
          planName: plan.name,
          price: plan.price,
          credit: plan.credit,
          expire:new Date(Date.now() + plan.validity * 24 * 60 * 60 * 1000), 
        },
      },
    });
  } else {
    return res
      .status(400)
      .json({ message: "Type parameter should be BOOSTPLAN or TOPUP" });
  }
    return res.status(200).json({ status: "ok" });
  } catch (error) {
 
    console.error("Transaction error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};



export const paymentfailed = async (req, res) => {
  console.log("***************failed-start***********************");
  console.log("Payment failed Payload: ", req.body.payload.payment.entity);
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
  let method = req.body.payload.payment.entity.method;
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
          otherTransaction: {
            method,
            razorpay_paymentId: razorpay_payment_id, //add more detail
          },
        },
      }
    );
// 
 let user= await Client.findOne({ _id:mypayment.user})

// boostplan none or expire
if (!user.isPlanActive) {
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

export const paymentCancel = async (req, res) => {
  console.log("cancel type")
const { razorpay_order_id } = req.body;
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
        $set: { status: "cancel" },
      }
    );
    //
    
  
    // boostplan none or expire
    if (!req.user.isPlanActive) {
      await UserEvents.updateOne(
        { clientId: req.user._id },
        {
          $set: {
            status: "paymentCanceled",
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
