const Note = require("../../models/noteModel/noteModel");

// Get all notes for a user
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId });
    res.status(200).json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching notes", error });
  }
};

// Create a new note
const createNote = async (req, res) => {
  try {
    const { title, content, tabId } = req.body;
    const note = await Note.create({
      userId: req.userId,
      title,
      content,
      tabId,
    });
    res.status(201).json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating note", error });
  }
};

// Update a note
const updateNote = async (req, res) => {
  try {
    const { title, content, tabId } = req.body;
    const note = await Note.findOneAndUpdate(
      { userId: req.userId, tabId },
      { title, content, lastModified: Date.now() },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating note", error });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const { tabId } = req.params;
    await Note.findOneAndDelete({ userId: req.userId, tabId });
    res.status(200).json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting note", error });
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
}; 