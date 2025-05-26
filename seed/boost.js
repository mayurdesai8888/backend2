// seed.js
import mongoose from "mongoose";
import BoostPlan from "../models/boostPlan_model.js";
// Adjust the path if needed

// Replace this with your actual MongoDB connection string


const seedBoostPlans = async () => {
  try {


    // Clear existing BoostPlan documents
    await BoostPlan.deleteMany();
    console.log("Existing boost plans removed.");

    // Sample boost plans
    const boostPlans = [
      {
        category: "workshop",
        name: "Workshop Basic Plan",
        price: 999,
        validity: 30, // days
        invoices: -1,
        loginLimit: 5,
        jobCards: -1,
        credit: 10,
        additionDetail: ["Support via Email", "Basic Analytics"],
      },
      {
        category: "technician",
        name: "Free Plan",
        price: 0,
        validity: -1,
        invoices: 30,
        loginLimit: 1,
        jobCards: 20,
        credit: 5,
        additionDetail: ["5 markeing template", "Free Help"],
      },
      {
        category: "technician",
        name: "Gold Plan",
        price: 8999,
        validity: 365,
        invoices: -1,
        loginLimit: 3,
        jobCards: -1,
        credit: 1200,
        additionDetail: ["Priority Support", "Mobile Access"],
      },
      {
        category: "technician",
        name: "Premium Plan",
        price: 3299,
        validity: 90,
        invoices: -1,
        loginLimit: 3,
        jobCards: -1,
        credit: 1200,
        additionDetail: ["Priority Support", "Mobile Access"],
      },
      {
        category: "workshop",
        name: "Workshop Unlimited Plan",
        price: 4999,
        validity: 365,
        invoices: 1000,
        loginLimit: 10,
        jobCards: 1000,
        credit: 50,
        additionDetail: ["Dedicated Support", "Custom Reports"],
      },
    ];

    await BoostPlan.insertMany(boostPlans);
    console.log("Boost plans seeded successfully.");


    console.log("MongoDB disconnected.");
  } catch (err) {
    console.error("Seeding error:", err);

  }
};


export default seedBoostPlans;


