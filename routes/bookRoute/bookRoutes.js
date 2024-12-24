const express = require("express");
const {
  createBook,
  getAllBooks,
  updateBook,
  deleteBook,
  getBookById,
} = require("../../controllers/bookController/bookController");
const authenticate = require("../../middleware/authMiddleware"); // Authentication middleware to verify the user

const router = express.Router();

// Route to create a new book (only accessible by authenticated users)
router.post("/create-books", authenticate, createBook);

// Route to get all books for the logged-in user
router.get("/getAll-books", authenticate, getAllBooks);

// Route to update a specific book by ID (only if it belongs to the logged-in user)
router.put("/update-book/:bookId", authenticate, updateBook);

// Route to delete a specific book by ID (only if it belongs to the logged-in user)
router.delete("/delete-book/:bookId", authenticate, deleteBook);
//router to get a book by id
router.get("/get-book/:bookId",authenticate, getBookById);
module.exports = router;
