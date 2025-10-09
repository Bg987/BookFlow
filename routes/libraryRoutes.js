const express = require("express");
const router = express.Router();
const AuthRolemiddleware= require("../middlewares/authenticateRoleMiddleware");
const controller = require("../controllers/libraryController");

router.post("/pre-signup", controller.preSignupLibrary);
router.get("/verify", controller.verifyLibrary);
router.post("/login", controller.libraryLogin);
router.get("/libdata", AuthRolemiddleware("library"), controller.getLibraryData);
module.exports = router;
