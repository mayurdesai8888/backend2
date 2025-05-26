import mongoose from "mongoose";
const templateSchema = new mongoose.Schema(
  {
    templateType: {
      type: String,
      enum: ["Marketing Template", "Festival Template", "Custom Template"],
      required: true,
    },
    templateImage: {
      type: String,
      required: true,
    },
    templateName: {
      type: String,
      required: true,
      trim: true,
    },
    templateDescription: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { timestamps: true }
);
const Template = mongoose.model("Template", templateSchema);

export default Template;