const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const booksController = require("../controllers/BooksController");
const authenticateRole = require("../middlewares/authenticateRoleMiddleware");

// Add a book (optional file upload for cover)
router.post(
  "/addBook",
  authenticateRole("librarian"),
  upload.single("cover"),
  booksController.addBook
);
router.get("/getBooks", authenticateRole("librarian"), booksController.getBooks);
router.patch(
  "/updateBook/:bookId",
  authenticateRole("librarian"),
  booksController.updateBook
);

module.exports = router;
