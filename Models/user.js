const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: String, unique: false },
  isAdmin: { type: String, unique: false },
  otp: { type: String },
});

module.exports = mongoose.model("User", userSchema);
