import mongoose from "mongoose";

// Payment Schema
const PaymentSchema = new mongoose.Schema({
  razorpay_order_id: {
    type: String,
    required: true,
    unique: true,
  },
  razorpay_paymentId: {
    type: String,
    required: false,
  },
  razorpay_signature: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "planTypeRef",
  },
  planTypeRef: {
    type: String,
    enum: ["TopUp", "BoostPlan"],
    required: true,
  },
 
  planName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "closed", "cancel", "success"],
    required: true,
  },
  description: {}, //any
  method: {
    type: String,
  //  enum: ["card", "netbanking", "wallet", "emi", "upi"],
  }, 
  contactNo: {
    type: String,
  }, //payment contactNo used,
  card_id: {
    type: String,
  }, // name of card holder
  card_detail: {}, //its an object
  upi_object: {}, //its an object
  otherTransaction: [
    {
      razorpay_paymentId: {
        type: String,
      },
      method: {
        type: String,
     //   enum: ["card", "netbanking", "wallet", "emi", "upi"],
      }, 
      contactNo: {
        type: String,
      }, //payment contactNo used,
      card_id: {
        type: String,
      }, // name of card holder
      card_detail: {}, //its an object
      upi_object: {}, //its an object
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", PaymentSchema);
export default Payment;