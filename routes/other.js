const express = require("express");
const {
  logout,
  ForgotPassword,
  ResetPassword,
  cleanData,
} = require("../controllers/other");
const router = express.Router();

router.post("/logout", logout); 
router.post("/forgotPass", ForgotPassword);
router.post("/resetPass", ResetPassword);
router.get("/cronjobs", cleanData);
module.exports = router;
