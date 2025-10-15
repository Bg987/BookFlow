// models/Book.js
const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    isbn: { type: String, required: true },
    title: { type: String, required: true },
    authors: [String],
    publishers: [String],
    publish_places: [String],
    publish_date: String,
    number_of_pages: Number,
    edition: String,
    subjects: [String],
    subject_places: [String],
    description: String, // NEW FIELD
    cover: {
      medium: String,
    },
    copies: { type: Number, default: 1 },
    library_id: { type: String, required: true },
  },
  { timestamps: true }
);

// unique per library
BookSchema.index({ isbn: 1, library_id: 1 }, { unique: true });

module.exports = mongoose.model("Book", BookSchema);
