const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  projectManager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});
const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
