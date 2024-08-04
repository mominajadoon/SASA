const mongoose = require("mongoose");

const ProjectHistorySchema = new mongoose.Schema({
  name: String,
  userId: mongoose.Schema.Types.ObjectId,
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  createdAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ProjectHistory", ProjectHistorySchema);
