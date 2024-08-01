const Project = require("../Models/project");
const Room = require("../Models/rooms");
const Product = require("../Models/product");

// Create a new project

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
    const projects = await Project.find({ userId: req.user.id }).populate(
      "rooms products"
    );
    res.status(200).json(projects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add a room to a project
exports.addRoomToProject = async (req, res) => {
  const { projectId } = req.params;
  const { name } = req.body;
  try {
    const room = new Room({
      name,
      projectId,
    });
    await room.save();

    const project = await Project.findById(projectId);
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
    // Find the project by ID and delete it
    const project = await Project.findByIdAndDelete(projectId);

    // If the project doesn't exist, return a 404 error
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Remove all associated rooms with the projectId
    await Room.deleteMany({ projectId: projectId });

    // Remove the project reference from all associated products
    await Product.updateMany(
      { projects: projectId },
      { $pull: { projects: projectId } }
    );

    // Return a success response
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    // If there's an error, return a 400 status with the error message
    res.status(400).json({ error: err.message });
  }
};
