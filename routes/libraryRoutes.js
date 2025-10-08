const express = require("express");
const router = express.Router();
const { preSignupLibrary, verifyLibrary,libraryLogin } = require("../controllers/libraryController");

router.post("/pre-signup", preSignupLibrary);
router.get("/verify", verifyLibrary);
router.post("/login", libraryLogin);
module.exports = router;
