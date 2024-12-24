const TransactionBook = require("../../models/bookModel/bookModel");

// Create a new book
const createBook = async (req, res) => {
  try {
    const { bookname } = req.body;
    const userId = req.user.id; // Assuming the user ID is set in the request by authentication middleware

    // Check if the book already exists for the user
    const existingBook = await TransactionBook.findOne({ userId, bookname });
    if (existingBook) {
      return res
        .status(400)
        .json({ message: "You have already created this book." });
    }

    // Create a new book associated with the user
    const newBook = new TransactionBook({
      userId,
      bookname,
    });

    await newBook.save();
    res 
      .status(201)
      .json({ message: "Book created successfully", book: newBook });
  } catch (error) {
    console.error(error);

    // Handle the unique constraint error (if any)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({
          message: "A book with this name already exists for this user.",
        });
    }

    res.status(500).json({ message: "Error creating book" });
  }
};

// Get all books for the logged-in user 
const getAllBooks = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find books associated only with the logged-in user
    const books = await TransactionBook.find({ userId });
    res.status(200).json({ books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching books" });
  }
};

// Update a book by ID, only if it belongs to the logged-in user
const updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { bookname } = req.body;
    const userId = req.user.id;

    // Find the book by ID and check that it belongs to the logged-in user
    const book = await TransactionBook.findOne({ _id: bookId, userId });
    if (!book) {
      return res
        .status(404)
        .json({ message: "Book not found or access denied" });
    }

    // Update the book
    book.bookname = bookname;
    await book.save();
    res.status(200).json({ message: "Book updated successfully", book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating book" });
  }
};

// Delete a book by ID, only if it belongs to the logged-in user
const deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    // Find and delete the book if it belongs to the logged-in user
    const book = await TransactionBook.findOneAndDelete({
      _id: bookId,
      userId,
    });
    if (!book) {
      return res
        .status(404)
        .json({ message: "Book not found or access denied" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting book" });
  }
};

//get a book by id

const getBookById = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    // Find the book by ID and check that it belongs to the logged-in user
    const book = await TransactionBook.findOne({ _id: bookId, userId });
    if (!book) {
      return res
        .status(404)
        .json({ message: "Book not found or access denied" });
    }

    res.status(200).json({ book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching book" });
  }
};

module.exports = {
  createBook,
  getAllBooks,
  updateBook,
  deleteBook,
  getBookById,
};
