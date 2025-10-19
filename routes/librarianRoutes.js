const express = require("express");
const upload = require("../config/multer");
const router = express.Router();
const authenticateRole = require("../middlewares/authenticateRoleMiddleware");
const  is_verified  = require("../middlewares/verifiedCheck");//check verification of librarian
const controller = require("../controllers/librarian");

router.post("/AddLibrarian", authenticateRole("library"), upload.single("profilePic"), controller.addLibrarian);
router.get("/verify-librarian", controller.verifyLibrarian);
router.post("/LoginLibrarian", controller.LoginLibrarian);
router.get(
  "/getLibrarian",
  authenticateRole("librarian"),
  is_verified,
  controller.Librariandata
);

module.exports = router;