import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.error("Local file path not provided for Cloudinary upload.");
      return null;
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // File uploaded successfully
    fs.unlinkSync(localFilePath);  // Clean up local temp file
    return response;

  } catch (error) {
    console.error("Cloudinary upload failed:", error);

    // Even if upload fails, try deleting temp file
    try {
      fs.unlinkSync(localFilePath);
    } catch (fsError) {
      console.error("Failed to delete local temp file after Cloudinary error:", fsError);
    }

    return null;
  }
};

export { uploadOnCloudinary };
