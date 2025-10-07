const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { sendMail } = require("../config/mail");
const Library = require("../models/Library");
const Datastore = require("../utils/tempStore");

require("dotenv").config();

// Step 1: Pre-signup (send verification link)
exports.preSignupLibrary = async (req, res) => {
  try {
    const { library_name, email, username, password, founded_year, latitude, longitude } = req.body;

    if (!library_name || !email || !username || !password || !founded_year || !latitude || !longitude) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Library.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const lib_id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Temporarily store signup data until verification
    const tempData = {
      lib_id,
      library_name,
      email,
      username,
      hashedPassword,
      founded_year,
      latitude,
      longitude,
    };
    Datastore.saveTempSignup(lib_id, tempData);

    // Generate verification token
    const token = jwt.sign({ lib_id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const verifyLink = `${process.env.FRONTEND_URL}/api/library/verify?token=${token}`;

    // Email content
    const subject = "Verify your BookFlow Library Account";
    const message = `
      <h2>Welcome to BookFlow 📚</h2>
      <p>Click the button below to verify your account:</p>
      <a href="${verifyLink}" target="_blank" 
         style="background:#4CAF50;color:white;padding:10px 15px;border-radius:5px;text-decoration:none;">Verify Account</a>
      <p>This link expires in 15 minutes.</p>`;
    const temp = await sendMail(email, subject, message);
    if (!temp) return res.status(500).json({ message: "error in email module" });
    res.json({ message: "✅ Verification email sent! Please check your inbox." });
  } catch (error) {
    console.error("Error in preSignupLibrary:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Step 2: Verify signup (final creation)
exports.verifyLibrary = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Invalid token" });

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tempData = Datastore.getTempSignup(decoded.lib_id);
    if (!tempData) return res.status(400).json({ message: "Token expired or invalid" });

    // Create the library in DB
    // Create the library in DB
await Library.create({
  lib_id: tempData.lib_id,
  library_name: tempData.library_name, // or 'name' if your model uses 'name'
  email: tempData.email,
  username: tempData.username,
  password: tempData.hashedPassword,
  founded_year: tempData.founded_year,
  latitude: tempData.latitude,
  longitude: tempData.longitude,
  verified: true, // mark verified after successful creation
  created_at: new Date(), // <-- set current timestamp
});
    // Clear temporary data
    Datastore.deleteTempSignup(decoded.lib_id);
    res.status(200).json({ message: "🎉 Library account verified and created successfully!" });
  } catch (error) {
    console.error("Verification failed:", error.message);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};
