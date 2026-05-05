const express = require("express");
const {
  createTask,
  getTasksByProject,
  updateTask,
  updateTaskStatus,
  getDashboardStats,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, createTask);
router.route("/dashboard").get(protect, getDashboardStats);
router.route("/project/:projectId").get(protect, getTasksByProject);
router.route("/:id/status").put(protect, updateTaskStatus);
router.route("/:id").put(protect, updateTask);

module.exports = router;
