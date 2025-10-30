const express = require("express");
const router = express.Router();
const authenticateRole = require("../middlewares/authenticateRoleMiddleware");
const controller = require("../controllers/libraryController");

router.post("/pre-signup", controller.addLibrary);
router.get("/verify", controller.verifyLibrary);
router.post("/login", controller.libraryLogin);
router.get("/libdata", authenticateRole("library"), controller.getLibraryData);
router.get(
  "/librariansdata",
  authenticateRole("library"),
  controller.getLibrariansData
);
router.get(
  "/ActivelibrarianIds",
  authenticateRole("library"),
  controller.getActiveLibrarianIds
);

module.exports = router;
