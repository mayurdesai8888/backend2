// seedTopUps.js

import TopUp from "../models/topUp_model.js";


const seedTopUps = async () => {
  try {


    // Clear existing top-up plans
    await TopUp.deleteMany();
    console.log("Existing top-up plans removed.");

    // Sample top-up plans
    const topUps = [
      {
        name: "Top-Up Small Pack",
        price: 199,
        validity: 30,
        credit: 10,
      },
      {
        name: "Top-Up Medium Pack",
        price: 499,
        validity: 60,
        credit: 30,
      },
      {
        name: "Top-Up Large Pack",
        price: 999,
        validity: 90,
        credit: 75,
      },
      {
        name: "Top-Up Unlimited",
        price: 1999,
        validity: 365,
        credit: 200,
      },
    ];

    await TopUp.insertMany(topUps);
    console.log("Top-up plans seeded successfully.");

  } catch (err) {
    console.error("Seeding error:", err);

  }
};


export default seedTopUps;
