const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Register user
// @route   POST /api/auth/signup
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  const userExists = await User.findOne({ email }).lean();
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password });

  if (user) {
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Login user
// @route   POST /api/auth/login
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      message: "Login successful",
      user: { _id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  console.log("updateUserProfile requested:", { id: req.user?._id, name, email });
  
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, email } },
      { new: true, runValidators: true }
    ).select("-password");

    if (updatedUser) {
      console.log("User updated successfully:", updatedUser._id);
      res.json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } else {
      console.error("User not found during update");
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Database error during profile update:", error);
    res.status(500);
    throw new Error("Error updating profile: " + error.message);
  }
});

// @desc    Update user password
// @route   PUT /api/auth/password
const updateUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  console.log("updateUserPassword requested for user ID:", req.user?._id);
  const user = await User.findById(req.user._id);

  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword;
    try {
      await user.save();
      console.log("Password updated successfully for user ID:", user._id);
      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Error saving new password:", error);
      res.status(500);
      throw new Error("Error updating password: " + error.message);
    }
  } else {
    res.status(401);
    throw new Error("Invalid current password");
  }
});

module.exports = { registerUser, authUser, updateUserProfile, updateUserPassword };
