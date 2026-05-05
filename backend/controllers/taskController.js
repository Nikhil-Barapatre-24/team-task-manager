const Task = require("../models/Task");
const Project = require("../models/Project");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create task
// @route   POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate, priority, project, assignedTo } = req.body;

  if (!title || !project || !assignedTo || assignedTo.length === 0) {
    res.status(400);
    throw new Error("Please fill in required fields (title, project, assignedTo)");
  }

  const projectDoc = await Project.findById(project).lean();
  if (!projectDoc) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (projectDoc.admin.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized, admin only can create tasks");
  }

  const task = await Task.create({ title, description, dueDate, priority, project, assignedTo });
  await task.populate("assignedTo", "name email");
  res.status(201).json({ success: true, task });
});

// @desc    Get project tasks
// @route   GET /api/tasks/project/:projectId
const getTasksByProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId).lean();
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const isMember = project.members.map(m => m.toString()).includes(req.user._id.toString()) || 
                   project.admin.toString() === req.user._id.toString();
  
  if (!isMember) {
    res.status(403);
    throw new Error("Not authorized to view tasks");
  }

  const tasks = await Task.find({ project: req.params.projectId })
    .populate("assignedTo", "name email")
    .lean();
    
  res.json({ success: true, tasks });
});

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const project = await Project.findById(task.project).lean();
  const isAdmin = project.admin.toString() === req.user._id.toString();
  const isAssigned = task.assignedTo && task.assignedTo.some(id => id.toString() === req.user._id.toString());

  if (!isAdmin && !isAssigned) {
    res.status(403);
    throw new Error("Not authorized to update this task");
  }

  task.status = status;
  await task.save();

  res.json({ success: true, task });
});

// @desc    Update task (full details)
// @route   PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate, priority, assignedTo, status } = req.body;
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const project = await Project.findById(task.project).lean();
  const isAdmin = project.admin.toString() === req.user._id.toString();

  if (!isAdmin) {
    res.status(403);
    throw new Error("Only project admins can edit task details");
  }

  task.title = title || task.title;
  task.description = description !== undefined ? description : task.description;
  task.dueDate = dueDate || task.dueDate;
  task.priority = priority || task.priority;
  task.assignedTo = assignedTo || task.assignedTo;
  task.status = status || task.status;

  await task.save();
  await task.populate("assignedTo", "name email");

  res.json({ success: true, task });
});

// @desc    Get dashboard stats
// @route   GET /api/tasks/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ admin: req.user._id }, { members: req.user._id }],
  }).select("_id").lean();

  const projectIds = projects.map((p) => p._id);
  const tasks = await Task.find({ project: { $in: projectIds } }).lean();

  const stats = {
    totalTasks: tasks.length,
    tasksByStatus: {
      "To Do": tasks.filter((t) => t.status === "To Do").length,
      "In Progress": tasks.filter((t) => t.status === "In Progress").length,
      "Done": tasks.filter((t) => t.status === "Done").length,
    },
    myTasks: tasks.filter((t) => t.assignedTo && t.assignedTo.some(id => id.toString() === req.user._id.toString())).length,
    overdueTasks: tasks.filter((t) => t.status !== "Done" && t.dueDate && new Date(t.dueDate) < new Date()).length,
  };

  res.json({ success: true, stats });
});

module.exports = {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  updateTask,
  getDashboardStats,
};
