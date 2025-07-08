// utils/twilio.js
import twilio from "twilio";

const accountSid = process.env.TWILIO_SID;
const authToken = [AuthToken];
const twilioPhone = "8957681217"; // e.g. "+1415XXXXXXX"

export const twilioClient = twilio(accountSid, authToken);
export const twilioSender = twilioPhone;
