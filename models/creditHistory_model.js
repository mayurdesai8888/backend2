import mongoose from "mongoose";





const CreditHistorySchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true,
  },
  creditUsedFrom: {
    type: String,
    enum: ["mainCredit", "allTopUp"],
  },
  MessageSendTo: {
    type: String,
    required: true,
  },
  contactName: { type: String },
  vehicleNo: {
    type: String,
  },
  service: {
    type: String,
  },
  purpose: {
    type: String,
    enum: ["reminder", "approval", "invoice"],
    required: true,
  },
  dataSend: {
    priReport: {
      type: String,
    },
    invoiceReport: {
      type: String,
    },
    nextServicedate: {
      type: Date,
    },
    pendingamt: {
      type: Number,
    },
  },
  vehicleNo: {
    type: String,
  },
  service: {
    type: String,
  },
  creditUsed: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["failed", "success", "pending"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
});

const CreditHistory = mongoose.model(
  "Credithistory",
  CreditHistorySchema
);
export default CreditHistory;
