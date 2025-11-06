const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { uploadToCloudinary } = require("../config/cloudinary");
const Username = require("../models/username");
const Librarian = require("../models/Librarian");
const Library = require("../models/Library");
const { handleLogin } = require("../utils/logincommon");
const { handleVerify } = require("../utils/verifyCommon");
const { sendMail } = require("../config/mail");
const { getSignedUrl } = require("../config/cloudinary");
const { rollBackCommon } = require("../utils/rollback");
const {
  addLibrarianEmail,
  AccountverifiedHTML,
} = require("../utils/EmailsTemplate");

exports.addLibrarian = async (req, res) => {
  let Uid;
  try {
    const lib_id = req.user.referenceId; // Library referenceId from middleware
    const { name, dob, email, username } = req.body;
    const profilePic = req.file;

    //Basic Validation
    if (!name || !dob || !email || !username || !profilePic) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const dateOfBirth = new Date(dob);
    const today = new Date();
    if (isNaN(dateOfBirth.getTime())) {
      return res.status(400).json({ message: "Invalid date of birth format." });
    }
    if (dateOfBirth > today) {
      return res
        .status(400)
        .json({ message: "Date of birth cannot be in the future." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const nameRegex = /^[A-Za-z0-9_]+$/;
    const cleanUsername = username.trim();
    if (!nameRegex.test(cleanUsername)) {
      return res.status(400).json({
        message: "Username must contain only letters, numbers, or underscores.",
      });
    }

    //Database Validation
    const usernameExists = await Username.findOne({ username });
    if (usernameExists)
      return res.status(400).json({ message: "Username already taken." });

    const emailExists = await Username.findOne({ email });
    if (emailExists)
      return res.status(409).json({ message: "Email already registered" });

    //Generate Credentials
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const uniqueId = uuidv4();
    Uid = uniqueId;

    // Verification Setup
    const verificationToken = uuidv4();
    const verificationExpire = new Date(Date.now() + 1000 * 60 * 60 * 24 * 15); // 15 days

    //Insert into MongoDB
    const newUser = await Username.create({
      username,
      email,
      password: hashedPassword,
      role: "librarian",
      referenceId: uniqueId,
      tempToken: verificationToken,
      tokenExpire: verificationExpire,
    });

    const newLibrarian = await Librarian.create({
      librarian_id: uniqueId,
      lib_id,
      name,
      dob,
    });

    res.status(201).json({
      message:
        "Librarian added successfully. Verification email sent",
    });

    //Handle Upload + Email in Background to reduce res. time
    (async () => {
      try {
        // Upload profile picture
        const profilePicUrl = await uploadToCloudinary(
          profilePic.buffer,
          "BookFlow/Profile_Pictures/librarians",
          "librarian_"
        );
        newUser.profilePicUrl = profilePicUrl;
        await newUser.save();
        
        // Prepare email
        const verifyLink = `${process.env.BACKEND_URL}/api/librarian/verify-librarian?token=${verificationToken}`;
        const subject = "BookFlow Librarian Account Created";
        const mailData = addLibrarianEmail(
          name,
          username,
          randomPassword,
          verifyLink
        );
        // Send verification email
       //await sendMail(email, subject, mailData);
      } catch (err) {
        console.error("Background error (upload/email):", err.message);
        if (Uid) {
          console.log("Rolling back librarian (background failure)...");
          const temp = await rollBackCommon(Uid, "librarian");
          if (!temp) {
            console.log("something wrong in rollback libraian");
          }
        }
      }
    })();
  } catch (error) {
    console.error("Error adding librarian:", error.message);
    if (Uid) {
      console.log("Rolling back librarian (main failure)...");
      const temp = await rollBackCommon(Uid, "librarian");
      if (!temp) {
        console.log("something wrong in rollback libraian");
      }
    }
    return res.status(500).json({ message: "Internal Server Error"});
  }
};

exports.verifyLibrarian = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await Username.findOne({ tempToken: token });
    const resVerify = await handleVerify({ req, res, token });
    if (!resVerify) {
      res.status(500).json({ message: "Internal Server Error" });
    }
    //find librarian's library id
    const tempLibId = await Librarian.findOne({
      attributes: ["lib_id"],
      where: {
        librarian_id: user.referenceId,
      },
    });
    if (!tempLibId) {
      return res.status(404).json({ message: "Library not found" });
    }
    //increamnet that library's librarian count as librarian verify account
    await Library.increment("total_librarians", {
      by: 1,
      where: { lib_id: tempLibId.dataValues.lib_id },
    });
    res.send(AccountverifiedHTML(role="librarian"));
  } catch (error) {
    console.error("Error verifying librarian:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.LoginLibrarian = async (req, res) => {
  await handleLogin({ role: "librarian", req, res });
};

exports.Librariandata = async (req, res) => {
  try {
    const librarian_data = await Librarian.findOne({
      where: { librarian_id: req.user.referenceId }, //librarin data from sql
    });
    if (!librarian_data) {
      return res.status(404).json({ message: "No librarian data found" });
    }
    const library_data = await Library.findOne({
      //librariy data from sql
      where: { lib_id: librarian_data.lib_id },
    });
    //remove password
    let userData = req.user;
    userData.password = null;
    //parse public id from full URL
    const fullUrl = userData.profilePicUrl;
    const urlParts = fullUrl.split("/upload/");
    const publicIdWithVersion = urlParts[1];
    const publicId = publicIdWithVersion.replace(/^v\d+\//, ""); // remove version
    userData.profilePicUrl = getSignedUrl(publicId);
    const FinalData = {
      library_data,
      librarian_data,
      userData,
    };
    res.status(200).json({ Data: FinalData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};
