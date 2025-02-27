const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getPasswords,
  addPassword,
  updatePassword,
  deletePassword,
  searchPasswords,
} = require("../controllers/passwordController");

// All routes are protected with authentication
router.use(protect);

// Get all passwords and search passwords
router.get("/passwords", getPasswords);
router.get("/passwords/search", searchPasswords);

// Add new password
router.post("/passwords", addPassword);

// Update and delete password
router.put("/passwords/:id", updatePassword);
router.delete("/passwords/:id", deletePassword);

module.exports = router;
