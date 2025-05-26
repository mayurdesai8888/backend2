import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  token: {
    type: String,
    default: null,
  },
  username: {
    type: String,
    unique: true,
     default: null,
  },
  role: {
    type: String,
    enum: ["mechanic", "technician", "workshop"],
    default: "mechanic", // Default role as mechanic
  },
  firstName: {
    type: String,
    default: null,
  },
  lastName: {
    type: String,
    default: null,
  },
  profileImage: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: "India (IN) ",
  },
  workshopGSTIN_No: {
    type: String,
    default: null,
  },
  sessions: [
    {
      expoToken: { type: String, required: false }, // for  notification
      sessionId: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ], // Array to store session IDs

  isPlanActive: {
    type: Boolean,
    default: false,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BoostPlan",
  },
  planExpire: {
    type: Date,
  },
  planName: {
    type: String,
  },
  AllTopUp: [
    {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "TopUp",
      },
      planName: {
        type: String,
      },
      credit: {
        type: Number,
      },
      expire: {
        type: Date,
        required: true,
      },
      price: {
        type: Number,
      },
    },
  ],
  credit: { type: Number, default: 5 },
  invoices: {
    type: Number,
    default: 10,
  },
  jobCards: {
    type: Number,
    default: 10,
  },
  loginLimit: {
    type: Number,
    default: 1,
  },
  notificationView: {
    type: Date,
    default: Date.now,
  },
  loginLimit: {
    type: Number,
    default: 1,
  },
  notificationView: {
    type: Date,
    default: Date.now,
  },

  boostPlan: {
    type: String,
    enum: ["basicPlan", "ProPlan", "UltimatePlan", "None"],
    default: "None",
  },
  credit: { type: Number, default: 10 },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Client = mongoose.model("Client", ClientSchema);
export default Client;
