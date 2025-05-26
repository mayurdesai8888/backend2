import mongoose from "mongoose";

const UserEventSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  status: {
    type: String,
    enum: ["browse", "paymentfailed", "paymentClick", "paymentCanceled"],
    default: "browse",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


// how many new user came? created at
// how many converted? by payment detail plus created at 
// how many left? by payment detail plus created at 
// how many are not freq user?  by payment detail plus created at 

const UserEvents = mongoose.model("UserEvents", UserEventSchema);
export default UserEvents;
