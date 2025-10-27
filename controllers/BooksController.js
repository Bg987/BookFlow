const QRCode = require("qrcode");
const Book = require("../models/Book");
const Library = require("../models/Library");
const BookLog = require("../models/bookLog");
const {uploadToCloudinary,cloudinary} = require("../config/cloudinary");
const Librarian = require("../models/Librarian");
const {deleteFromCloudinary} = require("../utils/cloudDelete")
const {encryptId,decryptId} = require("../utils/encryption")
const { v4: uuidv4 } = require("uuid");

exports.addBook = async (req, res) => {
  let id;
  try {
    const {
      title,
      authors,
      publishers,
      publish_places,
      publish_date,
      number_of_pages,
      edition,
      subjects,
      subject_places,
      description,
      copies,
      isbn,
    } = req.body;

    // Basic validations
    if (!title || !authors || !publishers || !publish_places || !number_of_pages || !subjects || !subject_places || !description || !copies) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }
    if (number_of_pages <= 0 || copies <= 0) {
      return res.status(400).json({ message: "Number of pages and copies must be positive non-zero numbers." });
    }
    const currentYear = new Date().getFullYear();
    if (parseInt(publish_date) > currentYear) {
      return res.status(400).json({ message: "Published year cannot be in the future." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Cover image is required." });
    }
    const cover = req.file;

    // Retrieve library_id of librarian
    const LibId = await Librarian.findOne({
      attributes: ["lib_id"],
      where: { librarian_id: req.user.referenceId },
      raw: true,
    });

    // Check for duplicate book
    if (isbn) {
      const existingBook = await Book.findOne({ isbn, library_id: LibId.lib_id });
      if (existingBook)
        return res.status(400).json({ message: "This book already exists in the library." });
    }

    const authorsArray = Array.isArray(authors) ? authors : authors.split(",").map(a => a.trim());
    const subjectsArray = Array.isArray(subjects) ? subjects : subjects.split(",").map(s => s.trim());

    // Generate book ID and QR code buffer
    id = uuidv4();
    const qrBuffer = await QRCode.toBuffer(encryptId(id), { type: "png" });

    // Create and save book with placeholders for URLs
    const newBook = new Book({
      librarian_id: req.user.referenceId,
      book_id: id,
      title,
      authors: authorsArray,
      publishers,
      publish_places,
      publish_date,
      number_of_pages,
      edition,
      subjects: subjectsArray,
      subject_places,
      description,
      cover: "", // will update later
      copies,
      isbn,
      library_id: LibId.lib_id,
      qrCodeUrl: "", // will update later
    });

    await newBook.save();
    await BookLog.create({
      bookId: id,
      action: "added",
      performedBy: req.user.referenceId,
    });
    await Library.increment("total_books", { by: 1, where: { lib_id: LibId.lib_id } });
    res.status(201).json({ message: "Book added successfully!", book: newBook });
    // Background async uploads
    (async () => {
      try {
        // Upload cover image
        const coverUrl = await uploadToCloudinary(cover.buffer, "BookFlow/Books", "book_");
        // Upload QR code
        const qrUrl = await uploadToCloudinary(qrBuffer, "BookFlow/QrCodes", "qr_");
        // Update book document with actual URLs
        newBook.cover = coverUrl;
        newBook.qrCodeUrl = qrUrl;
        await newBook.save();
      } catch (err) {
        console.error("Background upload failed:", err);
      }
    })();
  } catch (error) {
    console.error(error);
    try {
      // Rollback in case of failure
      await Book.deleteOne({ book_id: id });
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }
    return res.status(500).json({ message: "Server error", error });
  }
};

exports.getBooks = async (req, res) => {
  // Assuming you fetched lib_id using Sequelize
  const LibData = await Librarian.findOne({
    attributes: ["lib_id"],
    where: {
      librarian_id: req.user.referenceId,
    },
    raw: true,
  });

  if (!LibData) {
    return res.status(404).json({ message: "Library not found" });
  }
  const books = await Book.find({ library_id: LibData.lib_id });
  res.status(200).json({ books });
}

exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { isbn, copies } = req.body;

    // Validate input
    if (!isbn && copies === undefined) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    const updatedBook = await Book.findOneAndUpdate(
      { book_id: bookId },
      { $set: { isbn, copies } },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }
    await BookLog.create({
      bookId: bookId,
      action: "updated",
      performedBy: req.user.referenceId,
    });
    res.status(200).json({
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
