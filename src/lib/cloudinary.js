// Shared Cloudinary upload utility — use this in all API routes instead of fs.writeFile
// Supports: base64 data URIs (posts, profile images) and raw Buffers (chat, events via formData)

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a base64 data URI string to Cloudinary.
 * @param {string} base64DataUri  - e.g. "data:image/png;base64,..."
 * @param {string} folder         - Cloudinary folder name
 * @returns {Promise<string>}     - secure_url of the uploaded asset
 */
export function uploadBase64ToCloudinary(base64DataUri, folder = "club-sphear") {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            base64DataUri,
            { folder, resource_type: "image" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
    });
}

/**
 * Upload a raw Buffer to Cloudinary using an upload stream.
 * @param {Buffer} buffer         - file buffer
 * @param {string} folder         - Cloudinary folder name
 * @param {string} resourceType   - "image" | "raw" | "auto"
 * @returns {Promise<string>}     - secure_url of the uploaded asset
 */
export function uploadBufferToCloudinary(buffer, folder = "club-sphear", resourceType = "image") {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
}
