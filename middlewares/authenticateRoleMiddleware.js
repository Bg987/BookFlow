const jwt = require("jsonwebtoken");
const Username = require("../models/username");

const authenticateRole = (...allowedRoles) => {
  return async (req, res, next) => {
     console.log(req);
    try {
      const token = req.cookies?.token;
      if (!token) {
        return res
          .status(401)
          .json({ message: "No token provided. Authorization denied." });
      }
      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id, role } = decoded;

      // Check if decoded role is allowed before hitting DB
      if (!allowedRoles.includes(role)) {
        return res
          .status(403)
          .json({ message: "Access denied: insufficient permissions." });
      }

      // Find user in DB by referenceId
      const user = await Username.findOne({ referenceId: id });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Double-check DB role if needed (optional if token role is trusted)
      if (!allowedRoles.includes(user.role)) {
        return res
          .status(403)
          .json({ message: "Access denied: role mismatch with database." });
      }

      req.user = user; // attach user document to request
      next();
    } catch (err) {
      // Handle specific JWT errors
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Token expired. Please log in again." });
      } else if (err.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ message: "Invalid token. Please log in again." });
      }
      res.status(500).json({ message: "Server error during authentication." });
    }
  };
};

module.exports = authenticateRole;
