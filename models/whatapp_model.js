import mongoose from "mongoose";





const WhatappSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true,
  },
  MessageSendTo: {
    type: String,
    required: true,

  },
  purpose: {
    type: String,
  },
  creditUsed: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["failed", "success", "pending"],
    required: true,
  },

// datasend:{
// name:"",
// value:""

// //pending amt,
// //service due
// // invoice doc ? approval doc 
// },
createdAt: {
    type: Date,
    default: Date.now,
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
});

const Whatapp = mongoose.model("Whatapp", WhatappSchema);
export default Whatapp;
