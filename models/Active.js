const mongoose = require("mongoose");

const activeSessionSchema = new mongoose.Schema({
  id: { type: String, required: true }, 
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
});

activeSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("ActiveSession", activeSessionSchema);
