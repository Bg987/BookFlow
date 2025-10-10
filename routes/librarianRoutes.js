const express = require("express");
const upload = require("../config/multer");
const router = express.Router();
const AuthRolemiddleware= require("../middlewares/authenticateRoleMiddleware");
const controller = require("../controllers/librarian");

router.post("/AddLibrarian",AuthRolemiddleware("library"),upload.single("profilePic"), controller.addLibrarian);

module.exports = router;