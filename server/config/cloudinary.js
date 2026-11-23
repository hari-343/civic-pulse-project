import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const dataUri = `data:${mimetype};base64,${buffer.toString("base64")}`;
    cloudinary.uploader.upload(dataUri, { folder: "civic-pulse" }, (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    });
  });
};
