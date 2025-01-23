const express = require("express");
const {
  createBook,
  getAllBooks,
  updateBook,
  deleteBook,
  getBookById,
} = require("../../controllers/bookController/bookController");
const authenticate = require("../../middleware/authMiddleware"); // Authentication middleware to verify the user
const {upload} = require("../../middleware/UploadBook");

const router = express.Router();

// Route to create a new book (only accessible by authenticated users)
router.post("/create-book",authenticate, upload.single("profile"), createBook);
// Route to get all books for the logged-in user
router.get("/getAll-books", authenticate, getAllBooks);

// Route to update a specific book by ID (only if it belongs to the logged-in user)
router.put("/update-book/:bookId", authenticate, upload.single("profile"), updateBook);

// Route to delete a specific book by ID (only if it belongs to the logged-in user)
router.delete("/delete-book/:bookId", authenticate, deleteBook);

// Route to get a specific book by ID (only if it belongs to the logged-in user)
router.get("/get-book/:bookId", authenticate, getBookById);

module.exports = router;
