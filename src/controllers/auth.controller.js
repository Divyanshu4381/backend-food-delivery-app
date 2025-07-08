import { twilioClient, twilioSender } from "../utils/twilio.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Temporary in-memory store (for production use Redis/DB)
const otpStore = new Map();

// ✅ Send OTP
export const sendOTP = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    throw new ApiError(400, "Phone number is required");
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 mins expiry

  await twilioClient.messages.create({
    body: `Your OTP is ${otp}`,
    from: twilioSender,
    to: phone,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent successfully"));
});

// ✅ Verify OTP
export const verifyOTP = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    throw new ApiError(400, "Phone and OTP are required");
  }

  const stored = otpStore.get(phone);

  if (!stored) {
    throw new ApiError(400, "OTP not found or expired");
  }

  if (Date.now() > stored.expires) {
    otpStore.delete(phone);
    throw new ApiError(400, "OTP expired");
  }

  if (stored.otp != otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  otpStore.delete(phone);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP verified successfully"));
});
