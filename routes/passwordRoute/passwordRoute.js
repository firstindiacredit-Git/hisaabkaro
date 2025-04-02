const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const {
  getPasswords,
  addPassword,
  updatePassword,
  deletePassword,
  searchPasswords,
  updatePin,
} = require("../../controllers/passwordController/passwordController");

// All routes are protected with authentication
router.use(protect);

// Get all passwords and search passwords
router.get("/", getPasswords);
router.get("/search", searchPasswords);

// Add new password
router.post("/", addPassword);
router.post("/password/update-pin", updatePin);

// Update and delete password
router.put("/:id", updatePassword);
router.delete("/:id", deletePassword);

router.put("/password/update-pin", updatePin);  

module.exports = router;
