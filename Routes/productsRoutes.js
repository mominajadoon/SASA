// routes/productRoutes.js

const express = require("express");
const router = express.Router();
const productController = require("../Controllers/productController");
const upload = require("../utils/multerConfig");

router.post("/create", upload, productController.createProduct);
router.get("/", productController.getProducts);
router.get("/getProductById", productController.getProductById);
router.put("/update", productController.updateProduct);
router.delete("/delete", productController.deleteProduct);

// Add product to project
router.post(
  "/:projectId/products/:productId",
  productController.addProductToProject
);

// Submit customization request
router.post(
  "/products/:productId/customization",
  productController.submitCustomizationRequest
);

// Add a product to favorites
router.post("/favorites", productController.addToFavorites);

// Remove a product from favorites
router.delete("/removefavorites", productController.removeFromFavorites);

module.exports = router;
