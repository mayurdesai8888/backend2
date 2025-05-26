import mongoose from "mongoose";

// Mechanic & Technician Schema
const MechanicTechnicianSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true, // Automatically generate ObjectId
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  skillType: {
    type: String,
    enum: ["mechanic", "technician"],
    required: true,
  },
});

// Workshop Schema
const WorkshopSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    default: "workshop",
  },
  workshopName: {
    type: String,
    required: true,
  },
  workshopAddress: {
    type: String,
    required: true,
  },
  workshopLocation: {
    type: String,
    required: true,
  },
  workshopGSTIN_No: {
    type: String,
  },
  workshopImages: {
    type: [String], // Array of image URLs
    validate: {
      validator: function (arr) {
        return arr.length >= 5 && arr.length <= 20;
      },
      message: "Workshop must have between 5 and 20 images.",
    },
  },
  workshopLogo: {
    type: String,
  },
  workshopFrontPhoto: {
    type: String,
  },
  workshopOwnerPhoto: {
    type: String,
  },
  mechanics: [MechanicTechnicianSchema], // Nested array for mechanics
  technicians: [MechanicTechnicianSchema], // Nested array for technicians
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Workshop = mongoose.model("Workshop", WorkshopSchema);
export default Workshop;
