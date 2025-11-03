const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
//const authenticateRole = require("../middlewares/authenticateRoleMiddleware");
const controller = require("../controllers/memberController");


router.post("/pre-signup", upload.single("profilePic"), controller.addMember);

module.exports = router;