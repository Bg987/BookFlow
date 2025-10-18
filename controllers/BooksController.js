// controllers/bookController.js
const Book = require("../models/Book");
const Library = require("../models/Library");
const {uploadToCloudinary} = require("../config/cloudinary");
const Librarian = require("../models/Librarian");
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

    // Validate required fields (excluding ISBN, edition, publish_date)
    if (
      !title ||
      !authors ||
      !publishers ||
      !publish_places ||
      !number_of_pages ||
      !subjects ||
      !subject_places ||
      !description ||
      !copies 
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }
    //important validations
    if (number_of_pages <= 0) {
      return res.status(400).json({ message: "number pages must be positive non zero number" });
    }
    if (copies <= 0) {
      return res
        .status(400)
        .json({ message: "number of copies must be positive non zero number"});
    }
    const currentYear = new Date().getFullYear();
    if (parseInt(publish_date) > currentYear) {
      return res
        .status(400)
        .json({ message: "Founded year cannot be in the future." });
    }
    // Validate that a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Cover image is required." });
    }

    const cover = req.file;
    const LibId = await Librarian.findOne({
      attributes: ["lib_id"],
      where: {
        librarian_id: req.user.referenceId,
      },
      raw: true, 
    });
    if (isbn) {
      //find duplication based on isbn in library
      const existingBook = await Book.findOne({
        isbn,
        library_id: LibId.lib_id,
      });
      if (existingBook) {
        return res
          .status(400)
          .json({ message: "This book already exists in the library." });
      }
    } else {
      //if not isbn then based on other unique data of book in library
      const existingBookNoISBN = await Book.findOne({
        title,
        edition,
        authors,
        library_id: LibId.lib_id,
        isbn: { $exists: false },
      });
      if (existingBookNoISBN) {
        return res
          .status(400)
          .json({ message: "This book already exists in the library." });
      }
    }
    const authorsArray = Array.isArray(authors)
      ? authors
      : authors.split(",").map((a) => a.trim());

    const subjectsArray = Array.isArray(subjects)
      ? subjects
      : subjects.split(",").map((s) => s.trim());
    const uploadResult = await uploadToCloudinary(
      cover.buffer,
      "BookFlow/Books",
      "librarian_");
    id = uuidv4();
    // Create and save the new book
    const newBook = new Book({
      book_id : id,
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
      cover: uploadResult,
      copies,
      isbn,
      library_id: LibId.lib_id,
    });
    //increase number of books
    await newBook.save();
        await Library.increment("total_books", {
          by: 1,
          where: { lib_id: LibId.lib_id },
        });
    return res
      .status(201)
      .json({ message: "Book added successfully!", book: newBook });
  } catch (error) {
    console.error(error);
      try {
        // Delete from MongoDB
        //rollabck if uncertainty happen
        await Book.deleteOne({ book_id: id });
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    return res.status(500).json({ message: "Server error", error });
  }
};
