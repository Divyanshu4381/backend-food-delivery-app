import { twilioClient } from "../utils/twilio.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// ✅ Send OTP
export const sendOTP = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) throw new ApiError(400, "Phone number is required");

  

  try {
    await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications
      .create({ to: phone, channel: "sms" });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "OTP sent successfully"));
  } catch (err) {
    console.error("Twilio Error:", err);
    throw new ApiError(500, `Failed to send OTP: ${err.message}`);
  }
});

// ✅ Verify OTP
export const verifyOTP = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) throw new ApiError(400, "Phone and OTP are required");

  const verification = await twilioClient.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({ to: phone, code: otp });

  if (verification.status !== "approved") {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // Register or Login
  let user = await User.findOne({ phone });

  if (!user) {
    user = await User.create({
      phone,
      role: "customer",
    });
  }

  // Generate JWT tokens
  const accessToken = jwt.sign(
    { _id: user._id, phone: user.phone, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  const refreshToken = jwt.sign(
    { _id: user._id, phone: user.phone, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" }
  );

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set cookies
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user, accessToken, refreshToken },
        "OTP verified and login success"
      )
    );
});
