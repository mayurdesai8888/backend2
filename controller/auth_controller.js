import Client from "../models/auth_model.js";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import dotenv from "dotenv";
import generateUsername from "../utils/generateUsername.js";
import { generateProfileImage } from "../utils/generateProfileImage.js";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

// Twilio Config
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// send otp using session id
const sendOTP = async (req, res) => {

  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // OTP valid for 2 minutes

    // await client.messages.create({
    //   body: `Your OTP code is ${otp}`,
    //   from: process.env.TWILIO_PHONE,
    //   to: phone,
    // });

     console.log(`Your OTP code is ${otp}`);
    let user = await Client.findOne({ phone });

    if (!user) {
      user = new Client({ phone, otp, otpExpires });
    } else {
      user.otp = otp;
      user.otpExpires = otpExpires;
    }

    await user.save();
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  }
};

// verify otp using session id

const verifyOTP = async (req, res) => {

  const { phone, otp, expoToken } = req.body;
  console.log("expoToken", expoToken);

  try {
    const user = await Client.findOne({ phone });

  //  if (!expoToken) return res.status(400).json({ message: "expo Token not found" });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date(user.otpExpires) < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // **Restrict Login to Maximum 3 Sessions**
    if (user.sessions.length >= user.loginLimit) {
      return res.status(403).json({
        message:
          `Maximum ${user.loginLimit} devices allowed. Please log out from another device.`,
      });
    }

    // **Generate JWT Token**
    const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET, {
      expiresIn: "48h",
    });

    // **Ensure Username Exists**
    let username = user.username;
    if (!username) {
      username = await generateUsername(phone); // Generate if missing
      user.username = username;
    }

    // **Generate Unique Session ID**
    const sessionId = uuidv4();
    console.log("sessionId", sessionId);

    // sessionId.expoToken = expoToken;
    // **Store Session ID**
    user.sessions.push({ sessionId, expoToken });

    // **Increment login count**
    user.loginCount = (user.loginCount || 0) + 1;

    // **Clear OTP after successful verification**
    user.otp = null;
    user.otpExpires = null;
    user.token = token;

    await user.save();

    res.status(200).json({
      message: "OTP verified",
      token,
      sessionId, // Send sessionId for further authentication
      username: user.username,
      role: user.role,
      profileImage: user.profileImage,
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      workshopGSTIN_No: user.workshopGSTIN_No,
      loginCount: user.loginCount, // Return login count to frontend
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying OTP", error: error.message });
  }
};

// logout using session id

const logout = async (req, res) => {
  try {
    const sessionId = req.header("Session-Id"); // Get session ID from headers
    const phone = req.user.phone; // Extract phone from decoded JWT (from authMiddleware)

    // Find user by phone number
    const user = await Client.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Remove session ID from the list
    const initialSessionsCount = user.sessions.length;
    user.sessions = user.sessions.filter(
      (session) => session.sessionId !== sessionId
    );

    // Check if session existed before removal
    if (initialSessionsCount === user.sessions.length) {
      return res
        .status(400)
        .json({ message: "Invalid session ID or already logged out." });
    }

    await user.save();

    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging out.", error: error.message });
  }
};

// update profile
const updateProfile = async (req, res) => {
  try {
    const phone = req.user.phone; // Extract phone from decoded token

    // Find the user by phone number
    let user = await Client.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get request data
    const {
      firstName,
      lastName,
      address,
      workshopGSTIN_No,
      profileImage,
      role,
    } = req.body;

    // Allow switching between mechanic and technician
    if (role && (user.role === "mechanic" || user.role === "technician")) {
      if (role === "mechanic" || role === "technician") {
        user.role = role;
      } else {
        return res.status(400).json({
          message: "Role can only be changed between mechanic and technician.",
        });
      }
    } else if (role) {
      return res
        .status(400)
        .json({ message: "Only mechanics and technicians can switch roles." });
    }

    // Update only provided fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (address !== undefined) user.address = address;
    if (workshopGSTIN_No !== undefined)
      user.workshopGSTIN_No = workshopGSTIN_No;

    // Handle profile image update
    if (!profileImage && !user.profileImage) {
      // If no profile image exists, generate one
      user.profileImage = generateProfileImage(
        firstName || user.firstName,
        lastName || user.lastName
      );
    } else if (profileImage) {
      // Allow user to upload a custom profile image
      user.profileImage = profileImage;
    }

    // Save updated user
    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        workshopGSTIN_No: user.workshopGSTIN_No,
        profileImage: user.profileImage,
        role: user.role, // Include updated role
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

// view Profile data
const viewProfile = async (req, res) => {
  try {
    const phone = req.user.phone; // Extract phone from decoded token

    // Find the user by phone number
    let user = await Client.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("Fetched User:", user);

    // Return user profile data
    res.status(200).json({
      message: "Profile fetched successfully",
      username: user.username,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        workshopGSTIN_No: user.workshopGSTIN_No,
        profileImage: user.profileImage,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
};

export { sendOTP, verifyOTP, logout, updateProfile, viewProfile };
