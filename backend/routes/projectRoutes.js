const express = require("express");
const {
  createProject,
  getProjects,
  getProjectById,
  addMemberToProject,
  removeMemberFromProject,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, createProject).get(protect, getProjects);
router.route("/:id").get(protect, getProjectById);
router.route("/:id/members").put(protect, addMemberToProject);
router.route("/:id/members/:memberId").delete(protect, removeMemberFromProject);

module.exports = router;
