// models/Book.js
const mongoose = require("mongoose");


const BookSchema = new mongoose.Schema(
  {
    book_id: { type: String, required: true },
    library_id: { type: String, required: true }, // reference to library
    isbn: {
      type: String,
      validate: {
        validator: function (v) {
          // allow empty or valid ISBN-10/13
          return !v || /^[0-9]{10}([0-9X])?$|^[0-9]{13}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid ISBN!`,
      },
    },
    title: { type: String, required: true },
    authors: { type: [String], required: true },
    publishers: { type: [String], required: true },
    publish_places: { type: [String], required: true },
    publish_date: { type: String }, // now optional
    number_of_pages: { type: Number, required: true },
    edition: { type: String }, // now optional
    subjects: { type: [String], required: true },
    subject_places: { type: [String], required: true },
    description: { type: String, required: true },
    cover: { type: String, required: true }, // single image URL
    copies: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

// 1. Unique per library if ISBN exists
BookSchema.index(
  { isbn: 1, library_id: 1 },
  { unique: true, partialFilterExpression: { isbn: { $exists: true } } }
);

// 2. Unique per library if no ISBN (fallback)
BookSchema.index(
  { title: 1, edition: 1, authors: 1, library_id: 1 },
  { unique: true, partialFilterExpression: { isbn: { $exists: false } } }
);

// Text search across main searchable fields
BookSchema.index({
  book_id: "text",
  title: "text",
  authors: "text",
  subjects: "text",
  isbn: "text"
});

// Library-based filter index
BookSchema.index({ library_id: 1 });

module.exports = mongoose.model("Book", BookSchema);
