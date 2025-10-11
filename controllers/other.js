const Username = require("../models/username");
const { sendMail } = require("../config/mail");
const { resetPassEmail } = require("../utils/EmailsTemplate");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

exports.ForgotPassword = async (req, res) => { 
    try {
    const { identifier } = req.body; // username or email

    if (!identifier) {
      return res.status(400).json({ message: "Username or email is required" });
    }

    const user = await Username.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const resetToken = crypto.randomBytes(20).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set token and expiration (15 minutes)
    user.tempToken = hashedToken;
    user.tokenExpire = Date.now() + 15 * 60 * 1000;
    await user.save();
    const rLink = `${process.env.FRONTEND_URL}/resetPass?token=${resetToken}`;
    const subject = "BookFlow Account Password Reset Link";
    //const temp = await sendMail(user.email, subject, resetPassEmail(rLink));
    //if (!temp) return res.status(500).json({ message: "error in email module" });
    res.status(200).json({message: "Password Reset Link Send to Email",data: user});
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

exports.ResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;//resettoken

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    // Hash token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await Username.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // Token not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password and save
    user.password = await bcrypt.hash(newPassword, 10);

    // Clear reset token fields
    user.tempToken = undefined;
    user.tokenExpire = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in ResetPassword:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.logout = async (req, res) => { 
    res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.MODE !== "local",        // HTTPS in prod
    sameSite: process.env.MODE !== "local" ? "None" : "Strict", // match original cookie
  });
  res.status(200).json({ message: "Logged out successfully" });
}

