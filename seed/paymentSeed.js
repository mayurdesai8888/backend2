// seed.js
import mongoose from "mongoose";
import BoostPlan from "../models/boostPlan_model.js";
import Payment from "../models/payment_model.js";
import Whatapp from "../models/creditHistory_model.js";
// Adjust the path if needed

// Replace this with your actual MongoDB connection string

const paymentSeed = async () => {
  try {
    // Clear existing BoostPlan documents
    await Whatapp.deleteMany();
    console.log("Existing boost plans removed.");


    console.log("MongoDB disconnected.");
  } catch (err) {
    console.error("Seeding error:", err);
  }
};

export default paymentSeed;
