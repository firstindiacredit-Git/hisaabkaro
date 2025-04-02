const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/authMiddleware");
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} = require("../../controllers/noteController/noteController");

// All routes are protected with authentication
router.use(authenticate);

// Get all notes for the authenticated user
router.get("/", getNotes);

// Create a new note
router.post("/", createNote);

// Update a note
router.put("/", updateNote);

// Delete a note
router.delete("/:tabId", deleteNote);

module.exports = router; 