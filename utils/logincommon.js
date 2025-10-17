const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Username = require("../models/username");

exports.handleLogin = async ({req, res,role }) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  try {
    // Find user by username
    const user = await Username.findOne({ username });
    if (!user) return res.status(404).json({ message: `not found` });
    //check whether user is attempt login in valid role or not
    if (user.role != role) {
      return res
        .status(403)
        .json({ message: "Access denied: user not permitted." });
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.referenceId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Send token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      path : "/",
      secure: process.env.MODE !== "local",
      sameSite: process.env.MODE !== "local" ? "None" : "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: `Successfully logged in redirect to ${user.role} dashboard ` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
