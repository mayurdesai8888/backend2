import axios from "axios";
import dotenv from "dotenv";
import Whatapp from "../models/whatapp_model.js";
import Client from "../models/auth_model.js";

dotenv.config();
export const sendMessage = async (req, res) => {
  const { phoneNumber, name } = req.body;

  if (!phoneNumber || !name) {
    return res.status(400).json({
      success: false,
      error: "Phone number and name are required",
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
 const creditUsed = 1;
  try {

const client = await Client.findOne({
  _id: req.user._id,
});

if (client.credit < creditUsed) {
  return res.json({
    message: "you dont have enough credit to send this message  ",
  });
}


    const response = await axios.post(
      url,
      {
        template_name: process.env.templateName,
        broadcast_name: broadcastName,
        parameters: [{ name: "name", value: name }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WATI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

// imagnie we got id 
const messageId = Math.random().toString(36).substr(2, 9);
    // Create new workshop
    const whatapp = new Whatapp({
        messageId,
      MessageSendTo: cleanedNumber,
      purpose: "whatapp",
      status: "pending",
      creditUsed: creditUsed,
      createdBy: req.user._id,
    });

    await whatapp.save();

    res.status(200).json({
      success: true,
      data: response.data,
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
 
// get the id 
const {messageId}=req.body




    // Find the WhatsApp message record
    const whatapp = await Whatapp.findOne({
      messageId: messageId, // You probably need to use a meaningful query here
    });

    if (!whatapp) {
      return res
        .status(404)
        .json({ success: false, error: "Message not found" });
    }

    // Update the WhatsApp record
    await Whatapp.updateOne(
      { clientId: whatapp.createdBy },
      {
        $set: {
          status: "success",
        },
      }
    );

    // Update the client record to decrement credit
const client=await Client.findByIdAndUpdate(whatapp.createdBy, {
      $inc: { credit: -whatapp.creditUsed }, // Correct way to decrement a numeric field
    });
console.log("*******************************");
console.log(client);
console.log("*******************************");
    return res.status(200).json({
      success: true,
      data: "Message status saved and credit deducted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error:
        err?.response?.data ||
        "Failed to save message status and deduct credit",
    });
  }
};

export const sendMediaTemplate = async (req, res) => {
  const { phoneNumber, name, fileUrl, fileName } = req.body;

  if (!phoneNumber || !name || !fileUrl || !fileName) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: phoneNumber, name, fileUrl, fileName",
    });
  }

  try {
    const client = await Client.findOne({
      _id: req.user._id,
    });

    if (client.credit < creditUsed) {
      return res.json({
        message: "you dont have enough credit to send this message  ",
      });
    }

    const response = await axios.post(
      `${process.env.WATI_API_URL}/api/v1/sendTemplateMessage?whatsappNumber=${phoneNumber}`,
      {
        template_name: "job_consent_document",
        broadcast_name: "pre_repair_consent_202504",
        parameters: [{ name: "name", value: name }],
        media: {
          fileName: fileName,
          fileUrl: fileUrl,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WATI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // imagnie we got id
    const messageId = Math.random().toString(36).substr(2, 9);
    // Create new workshop
    const whatapp = new Whatapp({
      messageId,
      MessageSendTo: cleanedNumber,
      purpose: "sendMediaTemplate",
      status: "pending",
      creditUsed: creditUsed,
      createdBy: req.user._id,
    });

    await whatapp.save();

    res.status(200).json({
      success: true,
      data: response.data,
      messageId,
    });
  } catch (err) {
    console.error(
      "Template media send error:",
      err.response?.data || err.message
    );
    res.status(500).json({
      success: false,
      error: err.response?.data || err.message,
    });
  }
};

export const sendPaymentReminder = async (req, res) => {
  const { phoneNumber, name, amount, vehicleNumber, dueDate } = req.body;

  // Validation
  if (!phoneNumber || !name || !amount || !vehicleNumber || !dueDate) {
    return res.status(400).json({
      success: false,
      error:
        "Missing required fields: phoneNumber, name, amount, vehicleNumber, dueDate",
    });
  }

  // Clean and validate phone number
  const cleanedNumber = phoneNumber.replace(/\D/g, "");

  if (cleanedNumber.length < 10 || !/^\d{10}$/.test(cleanedNumber.slice(-10))) {
    return res.status(400).json({
      success: false,
      error: "Phone number must contain a valid 10-digit number",
    });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const broadcastName = `${
    process.env.broadcastName || "PaymentReminder"
  }-${timestamp}`;

  const url = `${process.env.WATI_API_URL}/api/v1/sendTemplateMessage?whatsappNumber=${phoneNumber}`;

  try {
    const client = await Client.findOne({
      _id: req.user._id,
    });

    if (client.credit < creditUsed) {
      return res.json({
        message: "you dont have enough credit to send this message  ",
      });
    }

    const response = await axios.post(
      url,
      {
        template_name: "pending_payment_reminder",
        broadcast_name: broadcastName,
        parameters: [
          { name: "1", value: name },
          { name: "2", value: amount },
          { name: "3", value: vehicleNumber },
          { name: "4", value: dueDate },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WATI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // imagnie we got id
    const messageId = Math.random().toString(36).substr(2, 9);
    // Create new workshop
    const whatapp = new Whatapp({
      messageId,
      MessageSendTo: cleanedNumber,
      purpose: "sendMediaTemplate",
      status: "pending",
      creditUsed: creditUsed,
      createdBy: req.user._id,
    });

    await whatapp.save();

    res.status(200).json({
      success: true,
      data: response.data,
      messageId,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: err.response?.data || "Failed to send message",
    });
  }
};

