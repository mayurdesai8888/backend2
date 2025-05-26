import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
export const sendWhatsAppMessage = async (req, res) => {
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

  try {
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

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: err.response?.data || "Failed to send message",
    });
  }
};

export const sendWhatsAppReceived = async (req, res) => {
  try {
    console.log(req);
    res.status(200).json({
      success: true,
      // data: response.data,
    });
  } catch (err) {
    console.log(err.response);
    res.status(500).json({
      success: false,
      error: err.response?.data || "Failed to send message",
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

    res.status(200).json({
      success: true,
      data: response.data,
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
      error: "Missing required fields: phoneNumber, name, amount, vehicleNumber, dueDate",
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

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: err.response?.data || "Failed to send message",
    });
  }
};

// export default sendWhatsAppMessage;
