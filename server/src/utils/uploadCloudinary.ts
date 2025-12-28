import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads and optimizes profile images
 */
const uploadOnCloudinary = async (localFilePath: string): Promise<UploadApiResponse | null> => {
    try {
        if (!localFilePath || !existsSync(localFilePath)) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: "e-commerce/profiles",
            resource_type: "image", // Explicitly set to image
            
            // --- Profile Specific Optimizations ---
            transformation: [
                { width: 500, height: 500, crop: "fill", gravity: "face" }, // Auto-detects face and crops to 500x500
                { quality: "auto", fetch_format: "auto" } // Compresses and converts to modern formats like WebP
            ]
        });

        await fs.unlink(localFilePath);
        return response;

    } catch (error) {
        if (existsSync(localFilePath)) {
            await fs.unlink(localFilePath).catch(() => {});
        }
        console.error("Cloudinary Profile Upload Error:", error);
        return null;
    }
};

export { uploadOnCloudinary };