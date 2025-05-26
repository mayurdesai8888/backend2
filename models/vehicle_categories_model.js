import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const ModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  variants: [VariantSchema],
});

const MakeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  models: [ModelSchema],
});

const VehicleCategoriesSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["car", "bike", "truck", "bus", "auto", "other"],
    required: true,
  },
  makes: [MakeSchema],
});

export default mongoose.model("VehicleCategories", VehicleCategoriesSchema);
