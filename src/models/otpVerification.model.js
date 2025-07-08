import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
});

export const OtpVerification = mongoose.model("OtpVerification", otpVerificationSchema);
