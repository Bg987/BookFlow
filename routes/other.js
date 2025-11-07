const express = require("express");
const {
  logout,
  ForgotPassword,
  ResetPassword,
  cleanData,
  handleRequestAction,
} = require("../controllers/other");
const authenticateRole = require("../middlewares/authenticateRoleMiddleware");
const router = express.Router();

router.post("/logout", logout); 
router.post("/forgotPass", ForgotPassword);
router.post("/resetPass", ResetPassword);
router.get("/cronjobs", cleanData);
router.put(
  "/handleRequestAction",
  authenticateRole("librarian", "library"),
  handleRequestAction
);
module.exports = router;


