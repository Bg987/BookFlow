const express = require("express");
const router = express.Router();
const { preSignupLibrary, verifyLibrary } = require("../controllers/libraryController");

router.post("/pre-signup", preSignupLibrary);
router.get("/verify", verifyLibrary);

module.exports = router;
