const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookie = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const { sendMail } = require("../config/mail");
const Library = require("../models/Library");
const Username = require("../models/username");
const Datastore = require("../utils/tempStore");

require("dotenv").config();

// Step 1: Pre-signup (send verification link)
exports.preSignupLibrary = async (req, res) => {
  //console.log(req.body);
  try {
    const { library_name, email, username, password, founded_year, latitude, longitude } = req.body;

    if (!library_name || !email || !username || !password || !founded_year || !latitude || !longitude) {
      return res.status(400).json({ message: "All fields are required" });
    }
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    if (username === password) {
      return res.status(400).json({ message: "Username and password cannot be the same." });
    }

    // Library name should not match username or password
    if (library_name === username || library_name === password) {
      return res.status(400).json({ message: "Library name cannot match username or password." });
    }

    // Founded year cannot be greater than current year
    const currentYear = new Date().getFullYear();
    if (parseInt(founded_year) > currentYear) {
      return res.status(400).json({ message: "Founded year cannot be in the future." });
    }
    const exists = await Username.findOne({ username });
    if (exists)
      return res.status(400).json({ message: "Username already taken. Please choose another." });

    const existing = await Username.findOne({ email });
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
    console.log("toekn = ", token);
    const subject = "Verify your BookFlow Library Account";
    const message = `
      <h2>Welcome to BookFlow 📚</h2>
      <p>Click the button below to verify your account:</p>
      <a href="${verifyLink}" target="_blank" 
         style="background:#4CAF50;color:white;padding:10px 15px;border-radius:5px;text-decoration:none;">Verify Account</a>
      <p>This link expires in 15 minutes.</p>`;
    const temp = await sendMail(email, subject, message);
    if (!temp) return res.status(500).json({ message: "error in email module" });
    res.status(200).json({ message: "✅ Verification email sent! Please check your inbox. and redirect to login in 3 seconds" });
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

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tempData = Datastore.getTempSignup(decoded.lib_id);
    if (!tempData)
      return res.status(400).json({ message: "Token expired or invalid" });

    console.log("✅ Temp data retrieved:", tempData);

    // Check required fields before DB operations
    if (!tempData.username || !tempData.email || !tempData.hashedPassword) {
      return res.status(400).json({
        message: "Missing essential signup data. Please re-register.",
      });
    }

    // ✅ Insert into MongoDB (Username collection)
    const createdUser = await Username.create({
      username: tempData.username,
      role: "library",
      referenceId: tempData.lib_id,
      email: tempData.email,
      password: tempData.hashedPassword,
    });
    console.log("✅ Mongo user created:", createdUser.username);

    // ✅ Insert into SQL (Library table)
    await Library.create({
      lib_id: tempData.lib_id,
      library_name: tempData.library_name,
      founded_year: tempData.founded_year,
      latitude: tempData.latitude,
      longitude: tempData.longitude,
      verified: true,
    });
    console.log("✅ Library record created in SQL");

    // ✅ Cleanup temporary data
    Datastore.deleteTempSignup(decoded.lib_id);

    return res.status(200).json({
      message: "🎉 Library account verified and created successfully!",
    });
  } catch (error) {
    console.error("❌ Verification failed:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

exports.libraryLogin = async (req, res) => {
   const { username, password } = req.body;
    if (!username || !password) 
      return res.status(400).json({message : "username and password required"})
  try {
    // Find user by username
    const user = await Username.findOne({ username });
    if (!user) return res.status(404).json({ message: "Library not found ! Wrong username" });
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });
    if (user.role !== "library") {
      return res.status(401).json({ message: "Unauthorized role access" });
    }
    // Generate JWT with id and role
    const token = jwt.sign(
      { id: user.referenceId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" });
res.cookie("token", token, {
  httpOnly: true,        // JS cannot access it
  secure: process.env.MODE !== "local",  // HTTPS required in production
  sameSite: process.env.MODE !== "local" ? "None" : "Strict", // cross-site
  maxAge: 24 * 60 * 60 * 1000, // 1 day
});

    res.status(200).json({message :"succesfully login"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};