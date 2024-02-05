const {
  signup,
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} = require("../services/authService");

const {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyPassResetCodeValidator,
  resetPasswordValidator,
} = require("../utils/validators/authValidator");

const router = require("express").Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgotpassword", forgotPasswordValidator, forgotPassword);
router.post(
  "/verifyResetCode",
  verifyPassResetCodeValidator,
  verifyPassResetCode
);
router.put("/resetPassword", resetPasswordValidator, resetPassword);

module.exports = router;
