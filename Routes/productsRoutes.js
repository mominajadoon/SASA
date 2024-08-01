// routes/productRoutes.js

const express = require("express");
const router = express.Router();
const productController = require("../Controllers/productController");
const upload = require("../utils/multerConfig");

router.post("/create",upload, productController.createProduct);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.put("/update/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

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

module.exports = router;
