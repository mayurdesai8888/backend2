import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    default: null, // null means it's a global notification
  },
  title: {
    type: String,
    required: true,
  },
  description: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
