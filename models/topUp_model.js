
import mongoose from "mongoose";

const TopUpSchema = new mongoose.Schema({
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
  credit: {
    type: Number,
    required: true,
  }
  
});

const TopUp = mongoose.model("TopUp", TopUpSchema);
export default TopUp;
