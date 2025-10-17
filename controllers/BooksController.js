const axios = require("axios");
const Book = require("../models/Book");
const cloudinary = require("../config/cloudinary"); // cloudinary setup

// Fetch book details from Open Library API by ISBN
exports.fetchBookByISBN = async (req, res) => {
  const { isbn } = req.params;
    console.log(isbn);
  try {
    const response = await axios.get(
      `https://openlibrary.org/api/books?bibkeys=ISBN${isbn}&format=json&jscmd=data`
      );
      console.log(response);
    const data = response.data[`ISBN:${isbn}`];
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found in Open Library" });
    }

    const bookData = {
      isbn,
      title: data.title || "",
      authors: data.authors?.map((a) => a.name) || [],
      publishers: data.publishers?.map((p) => p.name) || [],
      publish_places: data.publish_places?.map((p) => p.name) || [],
      publish_date: data.publish_date || "",
      number_of_pages: data.number_of_pages || 0,
      subjects: data.subjects?.map((s) => s.name) || [],
      subject_places: data.subject_places?.map((s) => s.name) || [],
      cover: {
        medium: data.cover?.medium || "",
      },
      description: data.notes || "",
    };

    res.json({ success: true, data: bookData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch book data" });
  }
};

// Save book to MongoDB (with copies, library id and optional cover upload)
exports.addBook = async (req, res) => {
  try {
    const {
      isbn,
      title,
      authors,
      publishers,
      publish_places,
      publish_date,
      number_of_pages,
      subjects,
      subject_places,
      description,
      copies,
      library_id,
    } = req.body;

    let cover = {};
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "BookFlow/Books",
      });
      cover.medium = result.secure_url;
    }

    // Check if book exists for same library
    let book = await Book.findOne({ isbn, library_id });

    if (book) {
      // If exists, update copies and cover/description if provided
      book.copies += Number(copies || 0);
      if (cover.medium) book.cover = cover;
      if (description) book.description = description;
      await book.save();
      return res.json({
        success: true,
        message: "Book updated successfully",
        book,
      });
    }

    // Create new book
    const newBook = new Book({
      isbn,
      title,
      authors,
      publishers,
      publish_places,
      publish_date,
      number_of_pages,
      subjects,
      subject_places,
      description,
      copies,
      cover,
      library_id,
    });

    await newBook.save();

    res.json({
      success: true,
      message: "Book added successfully",
      book: newBook,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add book" });
  }
};
