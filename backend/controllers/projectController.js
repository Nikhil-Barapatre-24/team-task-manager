const Project = require("../models/Project");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create project
// @route   POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Project name is required");
  }

  const project = await Project.create({
    name,
    description,
    admin: req.user._id,
    members: [req.user._id],
  });

  res.status(201).json({ success: true, project });
});

// @desc    Get user projects
// @route   GET /api/projects
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ admin: req.user._id }, { members: req.user._id }],
  }).populate("members", "name email").lean();

  res.json({ success: true, projects });
});

// @desc    Get project by ID
// @route   GET /api/projects/:id
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("members", "name email")
    .populate("admin", "name email")
    .lean();

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const isMember = project.members.some((m) => m._id.toString() === req.user._id.toString());
  const isAdmin = project.admin._id.toString() === req.user._id.toString();

  if (!isMember && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to view this project");
  }

  res.json({ success: true, project });
});

// @desc    Add project member
// @route   PUT /api/projects/:id/members
const addMemberToProject = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const User = require("../models/User");

  if (!email) {
    res.status(400);
    throw new Error("User email is required");
  }

  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (project.admin.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized, admin only");
  }

  const userToAdd = await User.findOne({ email }).lean();
  if (!userToAdd) {
    res.status(404);
    throw new Error("User not found");
  }

  if (project.members.includes(userToAdd._id)) {
    res.status(400);
    throw new Error("User already in project");
  }

  project.members.push(userToAdd._id);
  await project.save();

  res.json({ success: true, message: "Member added successfully", project });
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  addMemberToProject,
};
