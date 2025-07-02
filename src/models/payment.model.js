import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["UPI", "Card", "NetBanking", "COD"],
    required: true,
  },
  gateway: {
    type: String,
    enum: ["Stripe", "Razorpay", "COD"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed", "refunded"],
    default: "pending",
  },
  gatewayPaymentId: {
    type: String, // Razorpay PaymentId ya Stripe chargeId
  },
  receiptId: {
    type: String, // Razorpay me hota hai
  },
  transactionDetails: {
    type: mongoose.Schema.Types.Mixed, // Full raw response json, optional
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Payment", paymentSchema);
