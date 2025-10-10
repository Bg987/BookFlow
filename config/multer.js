// config/multer.js
const multer = require("multer");

// Store files in memory temporarily (for uploading to Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
