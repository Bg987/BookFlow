const express = require("express");
const router = express.Router();

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.MODE !== "local",        // HTTPS in prod
    sameSite: process.env.MODE !== "local" ? "None" : "Strict", // match original cookie
  });
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
