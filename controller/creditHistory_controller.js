import axios from "axios";
import dotenv from "dotenv";
import CreditHistory from "../models/creditHistory_model.js";
import Client from "../models/auth_model.js";
import BoostPlan from "../models/boostPlan_model.js";
import TopUp from "../models/topUp_model.js";

dotenv.config();
export const sendMessage = async (req, res) => {
  const {
    phoneNumber,
    name,
    message,
    purpose,
    nextServicedate,
    priReport,
    invoiceReport,
    pendingamt,
    service,
    vehicleNo,
  } = req.body;
// purpose - reminder ,jobCard, approval,

if (!purpose ||  !vehicleNo) {
  return res.status(400).json({ message: " purpose is required" });
}

if (purpose == "reminder") {

} 
 if (purpose == "approval" && !priReport) {
  return res.status(400).json({message:"for approval priReport url is required"})
 } 

  if (purpose == "invoice" && !invoiceReport) {
    return res
      .status(400)
      .json({ message: "for invoice invoiceReport url is required" });
  } 
  const creditUsed = 1;
  if (!phoneNumber || !name) {
    return res.status(400).json({
      success: false,
      error: "Phone number and name are required",
    });
  }
  console.log(req.user.credit);

  if (req.user.credit == 0 && !req.user.isPlanActive) {
    return res.status(400).json({
      message: "you dont have enough credit to send this message  ",
    });
  }

  // Remove country code and non-digit characters
  const cleanedNumber = phoneNumber.replace(/\D/g, "");

  // Check if the cleaned number ends with 10 digits
  if (cleanedNumber.length < 10 || !/^\d{10}$/.test(cleanedNumber.slice(-10))) {
    return res.status(400).json({
      success: false,
      error: "Phone number must contain a valid 10-digit number",
    });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const broadcastName = `${
    process.env.broadcastName || "Broadcast"
  }-${timestamp}`;

  const url = `${process.env.WATI_API_URL}/api/v1/sendTemplateMessage?whatsappNumber=${phoneNumber}`;

  try {
    let creditUsedFrom;
    if (!req.user.isPlanActive) {
      creditUsedFrom = "mainCredit";
    } else {
      if (req.user?.AllTopUp?.length && req.user.AllTopUp[0].credit) {
        creditUsedFrom = "allTopUp";
      } else {
        if (req.user.credit) {
          creditUsedFrom = "mainCredit";
        }
      }
    }

if (!creditUsedFrom) {
  return res.status(400).json({
    message: "you dont have enough credit to send this message  ",
  });
}





    const messageId = Math.random().toString(36).substr(2, 9);
    // Create new workshop
    const creditHistory = new CreditHistory({
      service,
      vehicleNo,
      messageId,
      MessageSendTo: phoneNumber,
      contactName: name,
      purpose,
      dataSend: {
        nextServicedate,
        priReport,
        invoiceReport,
        pendingamt,
      },
      status: "pending",
      creditUsed: creditUsed,
      createdBy: req.user._id,
      creditUsedFrom,
    });

    await creditHistory.save();

    res.status(200).json({
      success: true,
      // data: response.data,
      messageId,
    });
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: err.response?.data || "Failed to send message",
    });
  }
};

export const sendMessageReceivedStatus = async (req, res) => {
  try {
    const { messageId } = req.body;

    
    const creditHistory = await CreditHistory.findOne({ messageId });

    if (!creditHistory) {
      return res
        .status(404)
        .json({ success: false, error: "Message not found" });
    }

    if (creditHistory.status === "success") {
      return res
        .status(404)
        .json({ success: false, error: "status is already updated" });
    }

    console.log("creditHistory", creditHistory);

    let client;

    if (creditHistory.creditUsedFrom === "mainCredit") {
      client = await Client.findByIdAndUpdate(
        creditHistory.createdBy,
        { $inc: { credit: -creditHistory.creditUsed } },
        { new: true }
      );
    }

    if (creditHistory.creditUsedFrom === "allTopUp") {
      console.log("hello1");
      const clientData = await Client.findById(creditHistory.createdBy);

      // Find the index of the first top-up with sufficient credit
      const topUpIndex = clientData.AllTopUp.findIndex(
        (topUp) => topUp.credit >= creditHistory.creditUsed
      );
      console.log("hello2");
      if (topUpIndex === -1) {
        return res.status(400).json({
          success: false,
          error: "No top-up found with sufficient credit",
        });
      }
      console.log("hello3");
      const fieldPath = `AllTopUp.${topUpIndex}.credit`;

      // Deduct the credit
      await Client.findByIdAndUpdate(creditHistory.createdBy, {
        $inc: { [fieldPath]: -creditHistory.creditUsed },
      });
      console.log("hello4");
      // Remove expired or zero-credit top-ups
      await Client.findByIdAndUpdate(creditHistory.createdBy, {
        $pull: {
          AllTopUp: {
            $or: [{ credit: { $lte: 0 } }, { expiryDate: { $lt: new Date() } }],
          },
        },
      });
    }
    console.log("hello5", messageId);
    const dat = await CreditHistory.updateOne(
      { messageId },
      { $set: { status: "success" } }
    );
    console.log(dat);
    


    return res.status(200).json({
      success: true,
      data: "Message status saved, credit deducted, and expired/empty top-ups removed.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err?.response?.data || "Failed to process request",
    });
  }
};

export const getAllCreditHistory = async (req, res) => {
  // const { phoneNumber, name } = req.body;

  try {

    const creditHistory = await CreditHistory.find({
      createdBy: req.user._id,
    });
let boostPlan, totalTopUp;



if (req.user.isPlanActive) {

  boostPlan = await BoostPlan.findById(req.user?.planId);
}

if (req.user?.AllTopUp.length>0) {
  totalTopUp = await TopUp.findById(
    req.user?.AllTopUp[0].planId,
  );
} 






let  defaultData = {
    defaultjobCard: 10,
    defaultinvoice: 10,
    defaultCredit: 10,
    totalTopUpCredit: totalTopUp?.credit,
    boostPlanCredit: boostPlan?.credit,
  };
  console.log("creditHistory", creditHistory);
    res.status(200).json({
      success: true,
      defaultData,
      user: {
        id: req.user._id,
        isPlanActive: req.user.isPlanActive,
        planId: req.user?.planId,
        planExpire: req.user?.planExpire,
        jobCards: req.user?.jobCards,
        invoices: req.user?.invoices,
        AllTopUp: req.user?.AllTopUp,
        credit: req.user?.credit,
        planName: req.user?.planName,
      },

      creditHistory,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed at fetching history",
    });
  }
};

export const getSingleCreditHistory = async (req, res) => {
  const { creditId } = req.body;

  if (!creditId) {
    return res.status(400).json({
      success: false,
      error: "creditId is required",
    });
  }

  console.log("Fetching credit history for ID:", creditId);

  try {
    const creditHistory = await CreditHistory.findById(creditId);

    if (!creditHistory) {
      return res.status(404).json({
        success: false,
        error: "Credit history not found",
      });
    }

    return res.status(200).json({
      success: true,
      creditHistory,
    });
  } catch (err) {
    console.error("Error fetching credit history:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch credit history",
    });
  }
};
