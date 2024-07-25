const User = require("../Models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { sendEmailOtp, sendResetPasswordEmail } = require("../Mails/nodemailer");

exports.register = async (req, res) => {
  const provider = "credentials";

  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      provider,
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      isAdmin: false,
    });

    await user.save();

    await sendEmailOtp(user.email);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "User registration failed" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user.isVerified) {
      await sendEmailOtp(email);
      res
        .status(200)
        .json({ message: "Email not verified! OTP sent to email." });
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password!" });
    }

    // Generate JWT without expiration
    const payload = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: "Login failed!" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;

    await user.save();

    res.json({ msg: "Email Verified!" });
  } catch (error) {
    res.status(400).json({ error: "OTP verification failed" });
  }
};

exports.resendEmailOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await sendEmailOtp(email);

    res.json({ msg: "Otp resent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.googleAuth = async (req, res) => {
  const { tokenId } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, sub } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, googleId: sub });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ error: "Google authentication failed" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Sending the reset password email
    await sendResetPasswordEmail(user.email, resetToken);

    // Returning the reset token in the response for testing purposes
    res.status(200).json({
      message: "Password reset token sent to email",
      resetToken: resetToken, // Include the reset token in the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    console.log("Reset token received:", token); // Log the received token

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log("Invalid or expired token");
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log("Password reset successful");
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPassword:", error); // Log errors
    res.status(500).json({ error: "Server error" });
  }
};
