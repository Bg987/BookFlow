const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookie = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const { sendMail } = require("../config/mail");
const { handleLogin } = require("../utils/logincommon");
const { handleVerify } = require("../utils/verifyCommon");
const Library = require("../models/Library");
const Username = require("../models/username");
const Librarian = require("../models/Librarian");
const ActiveSession = require("../models/Active");

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
    // validation
    const currentYear = new Date().getFullYear();
    if (parseInt(founded_year) > currentYear) {
      return res
        .status(400)
        .json({ message: "Founded year cannot be in the future." });
    }
    const usernameRegex = /^[A-Za-z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message: "Username must contain only letters, numbers, or underscores.",
      });
    }
    const passwordLower = password.toLowerCase();
    if (
      passwordLower === username.toLowerCase() ||
      passwordLower === library_name.toLowerCase() ||
      passwordLower === email.toLowerCase().split("@")[0] ||
      passwordLower === email
    ) {
      return res.status(400).json({
        message:
          "Password must not be the same as your username, library name, or email.",
      });
    }
    if (
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        message:
          "Invalid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180.",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    //database validations
    const existingUsername = await Username.findOne({ username });
    if (existingUsername)
      return res
        .status(400)
        .json({ message: "Username already taken. Please choose another." });

    const existingEmail = await Username.findOne({ email });
    if (existingEmail)
      return res.status(409).json({ message: "Email already registered." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const uniqueId = uuidv4();
    Uid = uniqueId;

    // Generate verification token
    const verificationToken = uuidv4(); //24 * 60 * 60 *
    const verificationExpire = new Date(Date.now() + 1000 * 15); // 15 days

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
    (async () => {
      try {
        await sendMail(email, subject, mailBody);
      } catch (mailErr) {
        console.error("Email sending failed:", mailErr);
      }
    })();
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
    const reseVerify = await handleVerify({ req, res, token });
    if (reseVerify) {
      res.send(AccountverifiedLibrary());
    }
  } catch (error) {
    console.error("Error verifying library:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.libraryLogin = async (req, res) => {
  await handleLogin({ role: "library", req, res });
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
      return res.status(404).json({ message: "No library data error" });
    }
    res.status(200).json({ data, verified: req.user.is_verified });
  } catch (error) {
    console.error("Error fetching library data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getLibrariansData = async (req, res) => {
  const lib_id = req.user.referenceId;
  try {
    // Fetch librarians from SQL
    const librarians = await Librarian.findAll({
      where: { lib_id },
      raw: true,
    });
    if (librarians.length === 0) {
      return res
        .status(404)
        .json({ message: "No librarians found for this library." });
    }

    //  Extract librarian IDs from SQL
    const librarianIds = librarians.map((lib) => lib.librarian_id);

    const usernames = await Username.find({
      referenceId: { $in: librarianIds },
    }).lean();

    // Merge both
    const mergedData = librarians.map((lib) => {
      const mongoUser = usernames.find(
        (user) => user.referenceId === lib.librarian_id
      );
      return {
        librarian_id: lib.librarian_id,
        lib_id: lib.lib_id,
        name: lib.name,
        dob: lib.dob,
        username: mongoUser?.username || "N/A",
        email: mongoUser?.email || "N/A",
        role: mongoUser?.role || "librarian",
        profilePicUrl: mongoUser?.profilePicUrl || null,
        is_verified: mongoUser?.is_verified || false,
        createdAt: mongoUser?.createdAt || null,
      };
    });
    res.status(200).json({
      success: true,
      librarians: mergedData,
    });
  } catch (err) {
    console.error("Error fetching librarians:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching librarians",
      error: err.message,
    });
  }
};

exports.getActiveLibrarianIds = async (req, res) => {
  try {
    const library_id = req.user.referenceId;

    //Fetch all active librarian IDs
    const activeLibrarians = await ActiveSession.find(
      { role: "librarian" },
      "id"
    );
    const activeIds = activeLibrarians.map((l) => l.id);
    //Filter librarians belonging to this library
    const librarians = await Librarian.findAll({
      where: {
        lib_id: library_id,
        librarian_id: activeIds, // Sequelize auto-converts to IN when array
      },
      attributes: ["librarian_id"], // like .select() in Mongoose
    });
    //Send only IDs
    const activeLibrarianIds = librarians.map((l) => l.librarian_id);
    res.status(200).json({
      success: true,
      activeLibrarianIds,
    });
  } catch (error) {
    console.error("Error fetching active librarian IDs:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
