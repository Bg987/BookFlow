const Librarian = require("../models/Librarian");

const is_verified = async (req, res, next) => {
  try {
    const librarian = await Librarian.findOne({
      attributes: ["is_verified"],
      where: { librarian_id: req.user.referenceId },
      raw: true,
    });
    if (!librarian) {
      return res.status(404).json({ message: "Librarian not found." });
    }

    if (!librarian.is_verified) {
      return res.status(403).json({
        message:
          "Your account is not verified. First logout then check your email to verify your account. If your verification link has expired, please contact the library to re-submit your details.",
      });
    }

    next(); 
  } catch (err) {
    console.error("is_verified middleware error:", err);
    res
      .status(500)
      .json({ message: "Server error during verification check." });
  }
};

module.exports = is_verified;
