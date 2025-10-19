const mongoose = require("mongoose");

const usernameSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    default: "abcd",
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["member", "library", "librarian"],
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  referenceId: {
    type: String,
    required: true,
    unique: true,
  },
  // Fields for password reset
  tempToken: String,
  tokenExpire: Date,
  profilePicUrl: {
    type: String,
    default: null,
  },
  is_verified: {
    type: Boolean,
    default: false, // default value for existing users
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Username", usernameSchema);
