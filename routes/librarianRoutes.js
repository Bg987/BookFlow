const express = require("express");
const upload = require("../config/multer");
const router = express.Router();
const authenticateRole = require("../middlewares/authenticateRoleMiddleware");
const controller = require("../controllers/librarianController.js");

router.post("/AddLibrarian", authenticateRole("library"), upload.single("profilePic"), controller.addLibrarian);
router.get("/verify-librarian", controller.verifyLibrarian);
router.post("/LoginLibrarian", controller.LoginLibrarian);
router.get(
  "/getLibrarian",
  authenticateRole("librarian"),
  controller.Librariandata
);

module.exports = router;