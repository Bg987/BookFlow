const Library = require("../models/Library");
const Username = require("../models/username");
const Librarian = require("../models/Librarian");
const Member = require("../models/member");
const { handleVerify } = require("../utils/verifyCommon");
//const ActiveSession = require("../models/Active");

const bcrypt = require("bcryptjs");
const { sendMail } = require("../config/mail");
const { uploadToCloudinary } = require("../config/cloudinary");
const { v4: uuidv4 } = require("uuid");
const { rollBackCommon } = require("../utils/rollback");
const {
  getVerificationEmail,
  AccountverifiedHTML,
} = require("../utils/EmailsTemplate");

exports.addMember = async (req, res) => { 
    let Uid;
    try {
        const { username, password, email, name, dob, city } = req.body;
        const profilePic = req.file;
        if (
          !username ||
          !password ||
          !email ||
          !name ||
          !dob ||
          !city ||
          !profilePic
        ) {
          return res.status(400).json({ message: "Aklklll fields are required" });
        }
        const usernameRegex = /^[A-Za-z0-9_]+$/;
        if (!usernameRegex.test(username)) {
          return res.status(400).json({
            message:
              "Username must contain only letters, numbers, or underscores.",
          });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ message: "Invalid email format." });
        }
        const dateOfBirth = new Date(dob);
        const today = new Date();
        if (isNaN(dateOfBirth.getTime())) {
          return res
            .status(400)
            .json({ message: "Invalid date of birth format." });
        }
        if (dateOfBirth > today) {
          return res
            .status(400)
            .json({ message: "Date of birth cannot be in the future." });
        }
        const passwordLower = password.toLowerCase();
        if (
          passwordLower === username.toLowerCase() ||
          passwordLower === name.toLowerCase() ||
          passwordLower === email.toLowerCase().split("@")[0] ||
          passwordLower === email
        ) {
          return res.status(400).json({
            message:
              "Password must not be the same as your username, name, or email.",
          });
        }
        const existingUsername = await Username.findOne({ username });
        if (existingUsername)
          return res
            .status(400)
            .json({
              message: "Username already taken. Please choose another.",
            });

        const existingEmail = await Username.findOne({ email });
        if (existingEmail)
          return res.status(409).json({ message: "Email already registered." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const uniqueId = uuidv4();
        Uid = uniqueId;
        // Generate verification token
        const verificationToken = uuidv4(); //
        const verificationExpire =
            new Date(Date.now() + 1000 * 60 * 60 * 24 * 15); // 15 days
        const newUser = await Username.create({
          username,
          email,
          password: hashedPassword,
          role: "member",
          referenceId: uniqueId,
          tempToken: verificationToken,
          tokenExpire: verificationExpire,
        });

        const newMember = await Member.create({
          member_id: uniqueId,
          name,
          dob,
          city,
        });

        res.status(201).json({
          message:
            "Member Created successfully,Verification Link send to registered email",
        });
        // Step 4: Run Cloudinary upload + email in background
        (async () => {
          try {
            // Upload profile picture
            const profilePicUrl = await uploadToCloudinary(
              profilePic.buffer,
              "BookFlow/Profile_Pictures/members",
              "member_"
            );
            newUser.profilePicUrl = profilePicUrl;
            await newUser.save();
            const verifyLink = `${process.env.BACKEND_URL}/api/member/verify?token=${verificationToken}`;
            const subject = "BookFlow Member Account Created";
            const mailBody = getVerificationEmail(role = "member", verifyLink);
            console.log(mailBody);
            // Send email
            //await sendMail(email, subject, mailBody);
          } catch (err) {
            console.error("Background task failed:", err);
            if (Uid) {
              console.log("Rolling back member (background failure)...");
              const temp = await rollBackCommon(Uid, "member");
              if (!temp) {
                console.log("something wrong in rollback libraian");
              }
            }
          }
        })();
    }
    catch (error) {
      if (Uid) {
        console.log("Rolling back member (main failure)...");
        const temp = await rollBackCommon(Uid, "member");
        if (!temp) {
          console.log("something wrong in rollback libraian");
          }
      }     
    res.status(500).json({ message: "Internal Server Error" });
  }
}

exports.verifyMember = async (req, res) => {
  try {
    const { token } = req.query;
    const reseVerify = await handleVerify({ req, res, token });
    if (reseVerify) {
      res.send(AccountverifiedHTML(role= "member"));
    }
  } catch (error) {
    console.error("Error verifying library:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.memberLogin = async (req, res) => {
  await handleLogin({ role: "member", req, res });
};