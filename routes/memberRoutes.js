const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const authenticateRole = require("../middlewares/authenticateRoleMiddleware");
const controller = require("../controllers/memberController");


router.post("/pre-signup", upload.single("profilePic"), controller.addMember);
router.get("/verify", controller.verifyMember);
router.post("/login", controller.memberLogin);
router.get(
  "/getMember",
  authenticateRole("member"),
  controller.Memberdata
);
router.get(
  "/GetNearLibs",
  authenticateRole("member"),
  controller.GetNearLibs
);
router.post("/apply", authenticateRole("member"), controller.sendRequest);
module.exports = router;