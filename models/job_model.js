import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  vehicleCategory: {
    type: String,
    enum: ["car", "bike", "truck", "bus", "auto", "other"],
    required: true,
  },

  jobType: {
    type: String,
    enum: ["bodypaint", "service"],
    default: null,
  },

  customerName: { type: String },
  customerPhone: { type: String },
  customerLocation: { type: String },
  customerAddress: { type: String },

  fuelType: {
    type: String,
    enum: ["petrol", "diesel", "cng", "ev"],
  },

  registrationNumber: { type: String },
  vinNumber: { type: String },
  rcImage: { type: String },
  make: { type: String },
  model: { type: String },
  variant: { type: String },

  fuelLevel: {
    type: String,
    enum: ["10%", "25%", "50%", "75%", "100%"],
  },

  odometerImage: { type: String },
  odometerReading: { type: Number },
  insuranceDue: { type: Date },
  pucDue: { type: Date },

  PRIInspection: [
    {
      imageType: {
        type: String,
        enum: ["interior", "exterior", "part"],
      },
      uploadImage: { type: String },
      imageDescription: { type: String },
      priChecks: {
        type: [String],
        enum: ["deepscratch", "paint", "chipoff", "dent", "rust", "crack"],
      },
    },
  ],

  serviceNote: { type: String },

  tyreType: {
    type: String,
    enum: ["steel wheel", "alloy wheel", "spare part"],
    default: "steel wheel",
  },

  tyreCondition: {
    type: String,
    enum: ["new", "good", "worn", "poor"],
  },

  spareTyre: { type: Boolean, default: false }, // ✅ New field

  wheelAlignmentBalancingDate: { type: Date },

  batteryCondition: {
    type: String,
    enum: ["healthy", "moderate", "weak"],
  },

  batteryExpiryDate: { type: Date },

  acCooling: {
    type: String,
    enum: ["poor", "moderate", "good"],
  },

  acServiceDue: { type: Date },

  assignedTechnicians: {
    technicianOrMechanicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: false, // can be set to true if needed
    },
    technicianOrMechanicName: { type: String },
  },

  services: [
    {
      serviceName: { type: String },
      serviceDescription: { type: String },
      serviceCharges: { type: Number },
    },
  ],

  parts: [
    {
      partName: { type: String },
      partQuantity: { type: Number },
      partPrice: { type: Number },
    },
  ],

  totalAmount: { type: Number, default: 0 }, // ✅ Moved to root

  serviceDue: { type: Date },

  totalInvoiceAmount: { type: Number, default: 0 }, // Auto-calculated field

  partPayments: [
    {
      paymentAmount: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      paymentDate: { type: Date, default: Date.now },
    },
  ],

  pendingPayment: { type: Number, default: 0 }, // Auto-calculated
  paymentConsent: { type: Boolean, default: false }, // true if pendingPayment == 0

  diagnosticReport: {
    diagnosticType: {
      type: String,
      enum: ["pre repair", "post repair"],
      required: true,
    },
    fileType: {
      type: String,
      enum: ["pdf", "image"],
      required: true,
    },
    uploadFile: {
      type: String,
      required: true,
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    phone: String,
    role: String,
    sessionId: String,
  },
});

// ✅ Updated pre-save logic
JobSchema.pre("save", function (next) {
  let serviceTotal = (this.services || []).reduce(
    (sum, s) => sum + (s.serviceCharges || 0),
    0
  );

  let partsTotal = (this.parts || []).reduce((sum, p) => {
    return sum + (p.partQuantity || 0) * (p.partPrice || 0);
  }, 0);

  this.totalAmount = serviceTotal + partsTotal;
  this.totalInvoiceAmount = this.totalAmount;

  const totalPaid = (this.partPayments || []).reduce(
    (sum, p) => sum + (p.paymentAmount || 0),
    0
  );
  const totalDiscount = (this.partPayments || []).reduce(
    (sum, p) => sum + (p.discount || 0),
    0
  );

  this.pendingPayment = this.totalAmount - totalPaid - totalDiscount;
  this.paymentConsent = this.pendingPayment <= 0;

  next();
});

const Job = mongoose.model("Job", JobSchema);
export default Job;
