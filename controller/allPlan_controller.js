import Client from "../models/auth_model.js";
import BoostPlan from "../models/boostPlan_model.js";
import TopUp from "../models/topUp_model.js";
import UserEvents from "../models/userEvent_model.js";
// enum: ["mechanic", "technician", "workshop"],
const getAllBoostPlan = async (req, res) => {
  try {
    let role = req.user.role;
    if(req.user.role==="mechanic"){
      role = "technician";
// return res.status(400).json({message:"mechanic cant get boostplan"})
    }

    // _id: user._id,
    // phone: user.phone,
    // role: user.role,
    // sessionId: sessionId,
    // isPlanActive: user.isPlanActive,
    // planId: user?.planId,
    // planExpire: user?.planExpire,
    // jobCards: user?.jobCards,
    // invoices: user?.invoices,
    // AllTopUp: user?.AllTopUp,
    // credit: user?.credit,



    const boostPlan = await BoostPlan.find({ category: role });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     // if boostplan is none or  plan is expire
//     // note plan expire is not mention 
//     if (!user.boostPlan == "None"|| false) {
//         //    let userEvent = await UserEvents.findOne({ clientId: user._id });

//         //    if (!userEvent) {
//         //      const browse = "browse";
//         //      const newUserEvent = new UserEvents({
//         //        clientId: user._id,
//         //        status: browse,
//         //      });



//         //      await newUserEvent.save();
//         //    }


//  await UserEvents.updateOne(
//    { clientId: user._id },
//    {
//      $set: {
//        status: "paymentfailed",
//        createdAt: new Date(),
//      },
//    },
//    { upsert: true }
//  );



//     }

    res.status(200).json({
      message: "all plan data send successfully",
      boostPlan,
      isPlanActive: req.user.isPlanActive,
      planId: req.user?.planId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error at fetching plan detail",
      error: error.message,
    });
  }
};

const getSingleBoostPlanDetail = async (req, res) => {
  console.log("hello world");
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(401).json({ message: "plan id required" });
    }

    const boostPlan = await BoostPlan.findById(planId);

    if (!boostPlan) {
      return res
        .status(401)
        .json({ message: "no boost plan found by the given id " });
    }

    res.status(200).json({
      message: "plan data send successfully",
      boostPlan,
      isPlanActive: req.user.isPlanActive,
      planId: req.user?.planId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error at fetching plan detail",
      error: error.message,
    });
  }
};


const getAllTopUpPlan = async (req, res) => {
  try {
 
    if (!req.user?.isPlanActive) {
      return res.status(400).json({ message: "there no plan active" });
    }

 
  
    const topUp = await TopUp.find();

   

    res.status(200).json({
      message: "all plan data send successfully",
      topUp,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error at fetching plan detail",
      error: error.message,
    });
  }
};

const getSingleTopUpPlanDetail = async (req, res) => {
  console.log("hello world");
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(401).json({ message: "plan id required" });
    }

    const topUp = await TopUp.findById(planId);

    if (!topUp) {
      return res
        .status(401)
        .json({ message: "no topUp plan found by the given id " });
    }

    res.status(200).json({
      message: " topUp plan data send successfully",
      topUp,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error at fetching plan detail",
      error: error.message,
    });
  }
};




export { getAllBoostPlan, getSingleBoostPlanDetail,getAllTopUpPlan, getSingleTopUpPlanDetail };