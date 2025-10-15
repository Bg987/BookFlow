const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // temporary storage for Cloudinary upload
const booksController = require("../controllers/BooksController");
const authenticateRole = require("../middlewares/authenticateRoleMiddleware");

// Fetch book details by ISBN
router.get(
  "/fetchByISBN/:isbn",
  authenticateRole("librarian"),
  booksController.getBookByISBN
);
// Add a book (optional file upload for cover)
//router.post("/addBook", authenticateRole("librarian"),upload.single("cover"), booksController.addBook);

module.exports = router;
