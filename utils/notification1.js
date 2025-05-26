import { Expo } from "expo-server-sdk";

// Initialize Expo SDK
const expo = new Expo();

export async function sendPushNotification(req, res) {
 
 
  try {
    // Define your Expo Push Tokens
    const pushTokens = [
      "ExponentPushToken[bs3AoDCox3n5NSgVTY2TcG]",
      "ExponentPushToken[bs3AoDCox3n5NSgVTY2TcG]",
      "ExponentPushToken[zD3d8BBLsY-ErgeDmLfuMp]",
      "ExponentPushToken[HnPQCeMp-9ZieJ4bkbqF8r]",
      "ExponentPushToken[c5TDdNKWtGBbkTk0cUnGo3]",
      "ExponentPushToken[DORAm3Mnv3s8h0wj3VS-hx]",
      "ExponentPushToken[EjtUSLP9tKlhgviA7r14SG]",
    ];

    // Prepare the notification payload for Expo
    const messages = pushTokens.map((pushToken) => ({
      to: pushToken,
      sound: "default",
      title: `Hellodfddsfd from ${pushToken} Expo`,
      body: "This is a test push notification 👋",
      data: { withSome: "extraData" },
    }));

    // Send the notification via Expo's Push Notification Service
    const ticketChunk = await expo.sendPushNotificationsAsync(messages);
    console.log("Notification sent successfully:", ticketChunk);

    res.status(200).json({ message: "Notification sent successfully!" });
  } catch (error) {
    console.error("Error sending notification via Expo:", error);
    res
      .status(500)
      .json({ message: "Failed to send notification", error: error.message });
  }
}
