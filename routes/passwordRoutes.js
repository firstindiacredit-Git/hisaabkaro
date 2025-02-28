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
router.get("/", getPasswords);
router.get("/search", searchPasswords);

// Add new password
router.post("/", addPassword);

// Update and delete password
router.put("/:id", updatePassword);
router.delete("/:id", deletePassword);

module.exports = router;
