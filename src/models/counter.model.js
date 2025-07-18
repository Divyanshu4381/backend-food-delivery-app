import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: {
    type: String, // Example: "Zomato_2025"
    required: true
  },
  seq: {
    type: Number,
    default: 0
  }
});

export const Counter = mongoose.model("Counter", counterSchema);
