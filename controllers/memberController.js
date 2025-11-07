const Library = require("../models/Library");
const Username = require("../models/username");
const Librarian = require("../models/Librarian");
const LibraryRequest = require("../models/LibraryRequest");
const Member = require("../models/member");
const { Sequelize } = require("sequelize");
const { handleVerify } = require("../utils/verifyCommon");
const { handleLogin } = require("../utils/logincommon");

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

exports.Memberdata = async (req, res) => { 
  try {
    let data = {};
    data.user = req.user;
    data.user.password = "";
    const member_data = await Member.findOne({
      where: { member_id: req.user.referenceId }, //librarin data from sql
    });
    if (!member_data) {
      return res.status(404).json({ message: "No member data found" });
    }
    data.member = member_data;
//check assosiate to any library or not
    if (member_data.dataValues.lib_id) {
      const library_data = await Library.findOne({
        where: { lib_id: member_data.dataValues.lib_id },
      });
      data.library = library_data;
    }
//if not assosiate then check any req. for membership or not 
    else {
      const req = await LibraryRequest.findOne({
        where: { member_id: member_data.dataValues.member_id },
      });
      if(req) data.libMsg = "Request send to Library for approvel";
    }
    res.status(200).json({ data});
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
}

exports.GetNearLibs = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude required." });
    }

    // Haversine distance formula in SQL (in kilometers)
    const distanceFormula = Sequelize.literal(`
      6371 * acos(
        cos(radians(${lat})) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(${lon})) +
        sin(radians(${lat})) * sin(radians(latitude))
      )
    `);

    // Fetch ID, lib_id, name, and computed distance
    const libraries = await Library.findAll({
      attributes: [
        "lib_id",
        "name",
        "latitude",
        "longitude",
        [distanceFormula, "distance"],
      ],
      raw: true,
    });

    // Filter out invalid distances and sort ascending (nearest first)
    const filtered = libraries
      .map((lib) => ({
        id: lib.id,
        lib_id: lib.lib_id,
        name: lib.name,
        distance: parseFloat(lib.distance),
        latitude: lib.latitude,
        longitude: lib.longitude,
      }))
      .filter((lib) => !isNaN(lib.distance))
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      message: "Nearby libraries fetched successfully",
      data: filtered,
    });
  } catch (error) {
    console.error("Error in GetNearLibs:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.sendRequest = async (req, res) => {
  try {
    const { library_id } = req.body;
    const member_id = req.user.referenceId;

    // Check if member already applied or approved
    const existing = await LibraryRequest.findOne({
      where: { member_id, library_id },
    });

    if (existing && existing.status === "pending") {
      return res.status(400).json({ message: "Request already pending." });
    }

    if (existing && existing.status === "approved") {
      return res.status(400).json({ message: "Already approved." });
    }
    //check whether member is already assosiated with library or not
    const member = await Member.findByPk(member_id);
    if (member.lib_id) {
      return res
        .status(400)
        .json({ message: "You are already a member of a library." });
    }
    // Create new request
    const newRequest = await LibraryRequest.create({
      request_id: uuidv4(),
      member_id,
      library_id,
    });
    // Increment library pending count
    await Library.increment("pending_requests", {
      by: 1,
      where: { lib_id: library_id },
    });
    const library = await Library.findOne({ where: { lib_id: library_id } });
    // Emit counts to library room
    if (global._io) {
      global._io.to(library_id).emit("update-request-count", {
        total: library.total_members,
        pending: library.pending_requests,
        approved: library.rejected_requests,
      });
    }
    res.status(201).json({
      message: "Membership request sent successfully.",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error sending membership request:", error);
    res.status(500).json({ message: "Failed to send membership request." });
  }
};
