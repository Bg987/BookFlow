const mongoose = require("mongoose");

const bookLogSchema = new mongoose.Schema({
  bookId: {
    type: String,
    required: true,
  },
  libraryId: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ["added", "updated", "deleted"],
    required: true,
  },
  performedBy: {
    type: String, // or ObjectId if linked to user model
    required: true,
  },
  performedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("BookLog", bookLogSchema);
