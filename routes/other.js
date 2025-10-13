const express = require("express");
const { logout,ForgotPassword,ResetPassword } = require("../controllers/other");
const router = express.Router();

router.post("/logout", logout); 
router.post("/forgotPass", ForgotPassword);
router.post("/resetPass",ResetPassword);
module.exports = router;
