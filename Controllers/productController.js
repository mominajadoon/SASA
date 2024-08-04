// controllers/productController.js

const Product = require("../Models/product");
const Room = require("../Models/rooms");
const mongoose = require("mongoose");
const User = require("../Models/user");

const CustomizationRequest = require("../Models/customizationrequest");

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const {
      roomId,
      name,
      price,
      discountedPrice,
      itemCode,
      productionTime,
      category,
      brand,
      size,
      materials,
      color,
      roomType,
      styles,
      description,
      customization,
      customizationRequests,
      projects,
    } = req.body;

    // Extract the S3 URLs of the uploaded images
    const pictures = req.files.pictures.map((file) => file.location);

    const newProduct = new Product({
      pictures,
      name,
      price,
      discountedPrice,
      itemCode,
      productionTime,
      category,
      brand,
      size,
      materials,
      color,
      roomType,
      styles,
      description,
      customization,
      customizationRequests,
      projects,
    });

    await newProduct.save();

    // Add the product reference to the specified room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    room.products.push(newProduct._id);
    await room.save();

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const {
      id,
      roomId,
      name,
      price,
      discountedPrice,
      itemCode,
      productionTime,
      category,
      brand,
      size,
      materials,
      color,
      roomType,
      styles,
      description,
      customization,
      customizationRequests,
      projects,
    } = req.body;

    // Extract the S3 URLs of the uploaded images if any
    const pictures =
      req.files && req.files.pictures
        ? req.files.pictures.map((file) => file.location)
        : undefined;

    const updateData = {
      name,
      price,
      discountedPrice,
      itemCode,
      productionTime,
      category,
      brand,
      size,
      materials,
      color,
      roomType,
      styles,
      description,
      customization,
      customizationRequests,
      projects,
    };

    // Only set pictures if they are provided
    if (pictures) {
      updateData.pictures = pictures;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // If the roomId is provided, add the product reference to the specified room
    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      if (!room.products.includes(product._id)) {
        room.products.push(product._id);
        await room.save();
      }
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add product to project
exports.addProductToProject = async (req, res) => {
  const { projectId, productId } = req.params;
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    project.products.push(productId);
    await project.save();

    res.status(200).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Submit a customization request
exports.submitCustomizationRequest = async (req, res) => {
  const { productId } = req.params;
  const { requestDetails } = req.body;
  try {
    const customizationRequest = new CustomizationRequest({
      productId,
      userId: req.user.id,
      requestDetails,
    });
    await customizationRequest.save();
    res.status(201).json(customizationRequest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add a product to the user's favorites
exports.addToFavorites = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    // Validate the productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the product is already in favorites
    if (user.favorites.includes(productId)) {
      return res.status(400).json({ message: "Product already in favorites" });
    }

    // Add the product to the user's favorites
    user.favorites.push(productId);
    await user.save();

    res.status(200).json({ message: "Product added to favorites" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Remove a product from the user's favorites
exports.removeFromFavorites = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    // Validate the productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the product is in favorites
    if (!user.favorites.includes(productId)) {
      return res.status(400).json({ message: "Product not in favorites" });
    }

    // Remove the product from the user's favorites
    user.favorites.pull(productId);
    await user.save();

    res.status(200).json({ message: "Product removed from favorites" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
