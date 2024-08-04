const Project = require("../Models/project");
const Room = require("../Models/rooms");
const Product = require("../Models/product");
const mongoose = require("mongoose");
const ProjectHistory = require("../Models/projectHistory");

// Create a new project
exports.createProject = async (req, res) => {
  const { name } = req.body;
  try {
    const newProject = new Project({
      name,
      userId: req.user.id,
    });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// Get all projects for a user
exports.getProjects = async (req, res) => {
  try {
    // console.log("Authenticated User:", req.user);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const projects = await Project.find({ userId: req.user.id }).populate(
      "rooms products"
    );

    // console.log("Queried Projects:", projects);

    if (projects.length === 0) {
      return res.status(404).json({ message: "No projects found" });
    }

    res.status(200).json(projects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add a room to a project
exports.addRoomToProject = async (req, res) => {
  const { projectId, name } = req.body;

  if (!projectId || !name) {
    return res
      .status(400)
      .json({ error: "Please provide both projectId and room name." });
  }

  try {
    // Create a new Room with the given name and projectId
    const room = new Room({
      name,
      projectId,
    });
    await room.save();

    // Find the project by its ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Add the room's ID to the project's rooms array
    project.rooms.push(room._id);
    await project.save();

    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add a product to a room
exports.addProductToRoom = async (req, res) => {
  const { roomId, productId } = req.params;
  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });

    room.products.push(productId);
    await room.save();

    res.status(200).json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add a product to a project
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
// Delete a project
exports.deleteProject = async (req, res) => {
  const { projectId } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "Invalid project ID format" });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const projectHistory = new ProjectHistory({
      ...project.toObject(),
      deletedAt: new Date(), // Add deletion timestamp
    });
    await projectHistory.save();

    await Project.findByIdAndDelete(projectId);

    await Room.deleteMany({ projectId: projectId });

    await Product.updateMany(
      { projects: projectId },
      { $pull: { projects: projectId } }
    );

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
