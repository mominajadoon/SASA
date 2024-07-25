const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  register,
  login,
  verifyOtp,
  resendEmailOtp,
  forgotPassword,
  resetPassword,
} = require("../Controllers/authController");

router.post("/register", register);
router.post("/credentials-login", login);
router.post("/resend-otp", resendEmailOtp);
router.post("/verify-otp", verifyOtp);

// Google Auth
router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      error: false,
      message: "Successfully Logged In",
      user: req.user,
    });
  } else {
    res.status(403).json({ error: true, message: "Not Authorized" });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    error: true,
    message: "Log in failure",
  });
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: "/login/failed",
  }),
  (req, res) => {
    if (req.user) {
      const { accessToken } = req.user;
      res.json({ accessToken });
    }
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(process.env.CLIENT_URL);
});
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
