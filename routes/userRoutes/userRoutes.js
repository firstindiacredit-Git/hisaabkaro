const express = require("express");
const {
  signup,
  login,
  updateProfile,
  getUserProfile,
} = require("../../controllers/userController/userAuthController");
const { authenticate } = require('../../middleware/authMiddleware');
const{ uploadProfilePicture } = require("../../middleware/uploadImageMiddleware")

const router = express.Router();

// Route for user signup
router.post("/signup", uploadProfilePicture.single("profilePicture"), signup);

// Route for user login
router.post("/login", login);

// Route for updating user profile (protected)
router.patch("/update-profile/:userId",  uploadProfilePicture.single("profilePicture"), updateProfile);

// Route for getting user profile (protected)
router.get("/get-profile", authenticate, getUserProfile);

module.exports = router;
