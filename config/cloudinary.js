const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require("uuid");
const stream = require("stream");

// Cloudinary configuration (optional if already globally configured)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The buffer of the file (e.g., from multer).
 * @param {string} folder - The folder path in Cloudinary where the file will be stored.
 * @param {string} [prefix="file_"] - Optional prefix for naming the uploaded file.
 * @returns {Promise<string>} - Resolves with the secure URL of the uploaded image.
 */
const uploadToCloudinary = async (fileBuffer, folder, prefix = "file_") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: `${prefix}${uuidv4()}`,
        folder: folder,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};
44444444444
const getSignedUrl = (publicId) => {
  return cloudinary.url(publicId, { sign_url: true});
};
module.exports = { uploadToCloudinary, getSignedUrl };


