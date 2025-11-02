const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const Username = require("../models/username");

const createUser = async (username, email, password, role, res) => {
  try {
    // Basic validation
    const validRoles = ["member", "library", "librarian"];
    if (!validRoles.includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role provided." });
    }

    // Cross validation
    const lowerUsername = username.toLowerCase();
    const lowerEmail = email.toLowerCase();
    const lowerPassword = password.toLowerCase();

    if (lowerPassword.includes(lowerUsername)) {
      return res.status(400).json({
        success: false,
        message: "Password should not contain or match your username.",
      });
    }

    if (lowerPassword.includes(lowerEmail.split("@")[0])) {
      return res.status(400).json({
        success: false,
        message: "Password should not contain or match your email username.",
      });
    }

    if (lowerUsername === lowerEmail.split("@")[0]) {
      return res.status(400).json({
        success: false,
        message: "Username and email username part should not be the same.",
      });
    }

    // Database validation
    const existingUser = await Username.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists.",
      });
    }

    // Create user
    const referenceId = uuidv4();
    const tempToken = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Username({
      username,
      email,
      password: hashedPassword,
      role,
      referenceId,
      tempToken,
      tokenExpire: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day expiry
      is_verified: false,
    });

    await newUser.save();
    console.log(referenceId);
    return { referenceId, tempToken } 
  } catch (error) {
    console.error("Error in createUser:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

module.exports = { createUser };
