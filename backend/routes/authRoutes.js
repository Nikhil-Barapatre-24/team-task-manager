const express = require("express");
const { registerUser, authUser, updateUserProfile, updateUserPassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", authUser);
router.put("/profile", protect, updateUserProfile);
router.put("/password", protect, updateUserPassword);

module.exports = router;
