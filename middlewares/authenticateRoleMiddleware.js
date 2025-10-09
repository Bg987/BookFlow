const jwt = require("jsonwebtoken");
const Username = require("../models/username"); // your Mongoose model

const authenticateRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ message: "No token, authorization denied" });

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, role } = decoded;
          // Check if role is allowed
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: "Access denied: insufficient permissions" });
      }

      // Check user exists in DB by referenceId
      const user = await Username.findOne({ referenceId: id });
      if (!user) return res.status(404).json({ message: "User not found" });
      req.user = user; // attach user document to request
      next();
    } catch (err) {
      console.error(err);
      res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

module.exports = authenticateRole;
