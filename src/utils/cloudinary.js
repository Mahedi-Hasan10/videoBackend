import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};
const removeFromCloudinary = async (fileUrl, resource_type) => {
  try {
    if (!fileUrl) throw new Error("File URL is required");

    // Extract the public ID from the URL
    const publicId = fileUrl.split("/").slice(-2).join("/").split(".")[0];

    // Remove video from Cloudinary
    const result = await cloudinary.api.delete_resources([publicId], {
      type: "upload",
      resource_type: resource_type,
    });
    console.log(result);
    // if (result.deleted[publicId] !== "deleted") {
    //   throw new Error("Failed to remove file from Cloudinary");
    // }
    // return result;
    return;
  } catch (error) {
    console.error("Error removing from Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary, removeFromCloudinary };
