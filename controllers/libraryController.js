const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookie = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const { sendMail } = require("../config/mail");
const { handleLogin } = require("../utils/logincommon");
const Library = require("../models/Library");
const Username = require("../models/username");

const {
  getVerificationEmail,
  AccountverifiedLibrary,
} = require("../utils/EmailsTemplate");

require("dotenv").config();

// Step 1: Pre-signup (send verification link)
exports.addLibrary = async (req, res) => {
  let Uid;
  try {
    const {
      library_name,
      email,
      username,
      password,
      founded_year,
      latitude,
      longitude,
    } = req.body;


    if (
      !library_name ||
      !email ||
      !username ||
      !password ||
      !founded_year ||
      !latitude ||
      !longitude 
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const existingUsername = await Username.findOne({ username });
    if (existingUsername)
      return res
        .status(400)
        .json({ message: "Username already taken. Please choose another." });

    const existingEmail = await Username.findOne({ email });
    if (existingEmail)
      return res.status(409).json({ message: "Email already registered." });

    // Basic logic check
    const currentYear = new Date().getFullYear();
    if (parseInt(founded_year) > currentYear) {
      return res
        .status(400)
        .json({ message: "Founded year cannot be in the future." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uniqueId = uuidv4();
    Uid = uniqueId;

    // Generate verification token
    const verificationToken = uuidv4();//
    const verificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000 * 15); // 15 days

    // Step 1: Create in MongoDB (User collection)
    const newUser = await Username.create({
      username,
      email,
      password: hashedPassword,
      role: "library",
      referenceId: uniqueId,
      tempToken: verificationToken,
      tokenExpire: verificationExpire,
    });

    // Step 2: Create in SQL
    const newLibrary = await Library.create({
      lib_id: uniqueId,
      library_name,
      founded_year,
      latitude,
      longitude,
    });

    // Step 4: Send verification email
    const verifyLink = `${process.env.BACKEND_URL}/api/library/verify?token=${verificationToken}`;
    const subject = "BookFlow Library Account Created";
    const mailBody = getVerificationEmail(verifyLink);
    console.log(mailBody);
    //const resMail = await sendMail(email, subject, mailBody);
    // if (!resMail) {
    //   throw new Error("email error");
    // }
      res.status(201).json({
        message: "Library created successfully. Verification email sent.",
      });
  } catch (error) {
    console.error("Error adding library:", error);

    if (Uid) {
      try {
        await Username.deleteOne({ referenceId: Uid });
        await Library.destroy({ where: { lib_id: Uid } });
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Step 2: Verify signup (final creation)
exports.verifyLibrary = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Invalid verification link" });
    }

    // Find user by token
    const user = await Username.findOne({ tempToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Check expiry
    if (user.tokenExpire < new Date()) {
      return res
        .status(400)
        .json({
          message: "Verification token has expired. Please register Library again.",
        });
    }

    // Verify and activate
    user.tempToken = null;
    user.tokenExpire = null;
    user.is_verified = true;
    await user.save();

    res.send(AccountverifiedLibrary()); // HTML page for success
  } catch (error) {
    console.error("Error verifying library:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.libraryLogin = async (req, res) => {
  await handleLogin({role :"library",req, res,});
};

exports.getLibraryData = async (req, res) => {
  try {
    const lib_id = req.user.referenceId;
    const data = await Library.findAll({ where: { lib_id } });
    if (data.length > 1) {
      return res
        .status(404)
        .json({ message: "serious error contact developer" });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No library data " });
    }
    res.status(200).json({ data });
  } catch (error) {
    console.error("Error fetching library data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
