const Task = require("../models/Task");
const Project = require("../models/Project");

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, project, assignedTo } = req.body;

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (projectDoc.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized, admin only can create tasks" });
    }

    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      project,
      assignedTo,
    });

    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isMember = project.members.includes(req.user._id) || project.admin.toString() === req.user._id.toString();
    if (!isMember) {
      return res.status(403).json({ message: "Not authorized to view tasks for this project" });
    }

    const tasks = await Task.find({ project: req.params.projectId }).populate("assignedTo", "name email");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private (Assigned member or Admin)
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    const isAdmin = project.admin.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Dashboard Stats
// @route   GET /api/tasks/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // Find projects where user is member or admin
    const projects = await Project.find({
      $or: [{ admin: req.user._id }, { members: req.user._id }],
    });

    const projectIds = projects.map((p) => p._id);
    
    // Get stats for these projects
    const tasks = await Task.find({ project: { $in: projectIds } });

    const totalTasks = tasks.length;
    const tasksByStatus = {
      "To Do": tasks.filter((t) => t.status === "To Do").length,
      "In Progress": tasks.filter((t) => t.status === "In Progress").length,
      "Done": tasks.filter((t) => t.status === "Done").length,
    };

    const myTasks = tasks.filter((t) => t.assignedTo && t.assignedTo.toString() === req.user._id.toString()).length;
    
    const overdueTasks = tasks.filter((t) => t.status !== "Done" && new Date(t.dueDate) < new Date()).length;

    res.json({
      totalTasks,
      tasksByStatus,
      myTasks,
      overdueTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  getDashboardStats,
};
