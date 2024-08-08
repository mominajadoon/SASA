const express = require("express");
const router = express.Router();
const projectController = require("../Controllers/projectController");
const authMiddleware = require("../Middleware/authMiddleware");

// Create a new project
router.post("/create", authMiddleware, projectController.createProject);

// Get a single project by ID
router.post(
  "/getProjectById",
  authMiddleware,
  projectController.getProjectById
);

// Delete a project route
router.delete(
  "/deleteProject",
  // authMiddleware,
  projectController.deleteProject
);

// Get all projects for the authenticated user
router.get("/", authMiddleware, projectController.getProjects);

// Add a room to a project
router.post("/rooms", authMiddleware, projectController.addRoomToProject);

// Add a product to a room
router.post(
  "/rooms/:roomId/products/:productId",
  authMiddleware,

  projectController.addProductToRoom
);

// Add a product to a project
router.post(
  "/:projectId/products/:productId",
  authMiddleware,

  projectController.addProductToProject
);

module.exports = router;
