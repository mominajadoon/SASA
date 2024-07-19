const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return this.provider === "credentials";
    },
  },
  isVerified: { type: String, unique: false },
  isAdmin: { type: String, unique: false },
  otp: { type: String },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  provider: { type: String, required: true, enum: ["credentials", "google"] },
});

module.exports = mongoose.model("User", userSchema);
