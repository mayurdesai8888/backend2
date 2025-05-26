import Client from "../models/auth_model.js";
// import jwt from "jsonwebtoken";
// import twilio from "twilio";
// import dotenv from "dotenv";
// import generateUsername from "../utils/generateUsername.js";
// import { generateProfileImage } from "../utils/generateProfileImage.js";
// import { v4 as uuidv4 } from "uuid";
import Notification from "../models/notification_model.js";
import { sendPushNotification } from "../utils/sendPushNotification.js";





const sendNotificationToAll = async (req, res) => {
 const {  title, description } = req.body;

  try {
  
    let notification = new Notification({  
      title,
      description,
    });
    await notification.save();

  let users = await Client.find();
  if (!users) {
    return res.status(404).json({ message: "no User not found" });
  }


  // console.log(user.sessions);
  let pushTokens = [];

users.map((user,i)=>{
 user.sessions.map((e, i) => {
   if (e.expoToken) pushTokens.push(e.expoToken);
 });
})

  await sendPushNotification(pushTokens, title, description);

    res.status(200).json({ message: "notification sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending notification", error: error.message });
  }
};

const sendNotificationToUser = async (req, res) => {
  const { phone, title, description } = req.body;

  
  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {

    let user = await Client.findOne({ phone });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

let notification = new Notification({clientId: user._id, title, description });
    await notification.save();
   // console.log(user.sessions);
    let pushTokens = [];
    user.sessions.map((e,i)=>{
        if (e.expoToken) pushTokens.push(e.expoToken);
    })


await sendPushNotification(pushTokens, title, description);

    res.status(200).json({ message: "notification sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending notification", error: error.message });
  }
};

const sendNotificationToPlanUser = async (req, res) => {};



const userCheckedNotification = async (req, res) => {
  try {

    const phone = req.user.phone;
    const user = await Client.findOne({ phone });

    if (!user) {
      console.log("mmmmmmmmmm1")
      return res.status(404).json({ message: "User not found" });
    }

    const { notificationTime } = req.body;

    if (!notificationTime) {
            console.log("mmmmmmmmmm2");
      return res.status(400).json({ message: "notificationTime not sent" });
    }

    const newTime = new Date(notificationTime);
    if (isNaN(newTime.getTime())) {
                 console.log("mmmmmmmmmm3");
      return res.status(400).json({ message: "Invalid date format" });
    }

  const notification = await Notification.find({
    $or: [{ clientId: req.user._id }, { clientId: null }],
  });
  // if (user.notificationView && user.notificationView > newTime) {
  //      console.log("mmmmmmmmmm5");
  //     return res
  //       .status(400)
  //       .json({
          
  //         message: "notificationTime can't be less than previous time",
  //       });
  //   }
let oldnotificationTime = user.notificationView;

    user.notificationView = newTime;
    await user.save();

    return res.status(200).json({
      allNotifcation: notification,
      oldnotificationTime:oldnotificationTime,
      message: "Notification view time updated successfully",
    });
  } catch (error) {
       console.log("mmmmmmmmmm3eeee");
    return res.status(500).json({
      message: "Error updating notification view time",
      error: error.message,
    });
  }
};



export {
  sendNotificationToAll,
  sendNotificationToUser,
  sendNotificationToPlanUser,
  userCheckedNotification,
  
};
