// models/Product.js

const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  picture: String,
  name: String,
  price: Number,
  discountedPrice: Number,
  itemCode: String,
  productionTime: String,
  category: String,
  brand: String,
  size: [String],
  materials: String,
  color: String,
  roomType: String,
  styles: String,
  description: String,
  customization: {
    color: String,
    material: String,
    style: String,
  },
  customizationRequests: [
    { type: mongoose.Schema.Types.ObjectId, ref: "CustomizationRequest" },
  ],
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }], // Added field
});

module.exports = mongoose.model("Product", ProductSchema);
