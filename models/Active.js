const mongoose = require("mongoose");

const activeSessionSchema = new mongoose.Schema({
  userId: {
    type : String,
    required: true,
    unique: true, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 24 * 60 * 60 * 1000, // 1 day from creation
    index: { expires: "1d" }, // MongoDB TTL — auto delete after 1 day
  },
});

module.exports = mongoose.model("ActiveSession", activeSessionSchema);
