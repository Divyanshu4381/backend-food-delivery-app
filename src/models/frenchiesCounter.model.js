import mongoose from "mongoose";

const frenchiesCounterSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    unique: true, 
  },
  count: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("FrenchiesCounter", frenchiesCounterSchema);
