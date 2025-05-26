import mongoose from "mongoose";

const BoostPlanSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["workshop", "technician"],
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  validity: {
    type: Number,
    required: true,
  },
  // invoice: {
  //   type: mongoose.Schema.Types.Mixed,
  //   required: true,
  //   validate: {
  //     validator: (v) => typeof v === "number" || v === "unlimited",
  //     message: (props) => `${props.value} must be a number or "unlimited"`,
  //   },
  // },
  invoices: {
    type: Number,
    required: true,
  },

  loginLimit: {
    type: Number,
    required: true,
  },
  // jobCard: {
  //   type: mongoose.Schema.Types.Mixed,
  //   required: true,
  //   validate: {
  //     validator: (v) => typeof v === "number" || v === "unlimited",
  //     message: (props) => `${props.value} must be a number or "unlimited"`,
  //   },
  // },

  jobCards: {
    type: Number,
    required: true,
  },
  credit: {
    type: Number,
    required: true,
  },
  additionDetail: {
    type: [String],
  },
});

const BoostPlan = mongoose.model("BoostPlan", BoostPlanSchema);
export default BoostPlan;
