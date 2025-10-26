const Username = require("../models/username");

exports.handleVerify = async ({req,res, token }) => { 
    try {
        if (!token) {
            res.status(400).json({ message: "Invalid verification link" });
            return false;
        }
    // Find user by token
    const user = await Username.findOne({ tempToken: token });

    if (!user) {
        res.status(400).json({ message: "Invalid or expired token" });
        return false;
    }

    // Check expiry
    if (user.tokenExpire < new Date()) {
      res.status(400).json({
        message:
          "Verification token has expired. Please register again.",
      });
        return false;
    }

    // Verify and activate
    user.tempToken = null;
    user.tokenExpire = null;
    user.is_verified = true;
        await user.save();
        return true;
    }
    catch (error) {
        console.log("error in common verify ", error);
        res.status(500).json({ message: "Internal Server Error" });
        return false;
    }
}

