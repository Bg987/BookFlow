const express = require("express");
const upload = require("../config/multer");
const router = express.Router();
const AuthRolemiddleware= require("../middlewares/authenticateRoleMiddleware");
const controller = require("../controllers/librarian");

router.post("/AddLibrarian", AuthRolemiddleware("library"), upload.single("profilePic"), controller.addLibrarian);
router.get("/verify-librarian", controller.verifyLibrarian);

module.exports = router;