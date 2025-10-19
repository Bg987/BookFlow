const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const booksController = require("../controllers/BooksController");
const authenticateRole = require("../middlewares/authenticateRoleMiddleware");
const  is_verified  = require("../middlewares/verifiedCheck");//check verification of librarian
// Add a book (optional file upload for cover)
router.post(
  "/addBook",
  authenticateRole("librarian"),
  is_verified,
  upload.single("cover"),
  booksController.addBook
);

module.exports = router;
