const cloudinary = require("cloudinary").v2;

const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    // Split URL to extract path after "/upload/"
    const urlParts = imageUrl.split("/upload/");
    if (urlParts.length < 2) throw new Error("Invalid Cloudinary URL");

    const pathWithVersion = urlParts[1];

    // Remove version (v123456) and file extension
    const publicId = pathWithVersion
      .replace(/^v\d+\//, "") // remove version prefix
      .replace(/\.[^/.]+$/, ""); // remove extension

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
  }
};

module.exports = { deleteFromCloudinary };
