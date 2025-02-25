const TransactionBook = require("../../models/bookModel/bookModel");
const SelfRecord = require("../../models/transactionModel/selfRecordModel");
const Transaction = require("../../models/transactionModel/transactionModel");
const fs = require("fs");
const path = require("path");

// Create a new book
const createBook = async (req, res) => {
  try {
    const { bookname } = req.body;
    const userId = req.userId; // Assuming the user ID is set in the request by authentication middleware

    // Check if the book already exists for the user
    const existingBook = await TransactionBook.findOne({ userId, bookname });
    if (existingBook) {
      return res
        .status(400)
        .json({ message: "You have already created this book." });
    }

    // Get the profile image path (if uploaded)
    const profileImage = req.file ? `/uploads/book/${req.file.filename}` : ""; // Save the image path

    // Create a new book associated with the user
    const newBook = new TransactionBook({
      userId,
      bookname,
      profile: profileImage, // Set the profile field to the image path
    });

    await newBook.save();
    res
      .status(201)
      .json({ message: "Book created successfully", book: newBook });
  } catch (error) {
    console.error(error);

    // Handle the unique constraint error (if any)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "A book with this name already exists for this user.",
      });
    }

    res.status(500).json({ message: "Error creating book" });
  }
};

// Get all books for the logged-in user
const getAllBooks = async (req, res) => {
  try {
    const userId = req.userId;

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
    const userId = req.userId;

    // Find the book by ID and check that it belongs to the logged-in user
    const book = await TransactionBook.findOne({ _id: bookId, userId });
    if (!book) {
      return res
        .status(404)
        .json({ message: "Book not found or access denied" });
    }

    // Check if a new profile image is uploaded
    let profileImage = book.profile; // Keep the current profile image initially

    if (req.file) {
      // If a new image is uploaded, update the profile
      profileImage = `/uploads/book/${req.file.filename}`;

      // Delete the old profile image if it exists
      if (book.profile) {
        const oldImagePath = path.join(__dirname, "../../", book.profile);
        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (err) {
          console.error("Error deleting old image:", err);
          // Continue with the update even if image deletion fails
        }
      }
    }

    // Update the book details
    book.bookname = bookname;
    book.profile = profileImage;

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
    const userId = req.userId;

    // First find the book to get its profile image path
    const book = await TransactionBook.findOne({ _id: bookId, userId });
    if (!book) {
      return res
        .status(404)
        .json({ message: "Book not found or access denied" });
    }

    // Delete the profile image if it exists
    if (book.profile) {
      const imagePath = path.join(__dirname, "../../", book.profile);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.error("Error deleting image file:", err);
        // Continue with book deletion even if image deletion fails
      }
    }

    // Delete all transactions associated with this book from both models
    await Promise.all([
      SelfRecord.deleteMany({ bookId }),
      Transaction.deleteMany({ bookId }),
    ]);

    // Delete the book
    await TransactionBook.findByIdAndDelete(bookId);

    res.status(200).json({
      message: "Book and all associated transactions deleted successfully",
      deletedBook: book,
    });
  } catch (error) {
    console.error("Error in deleteBook:", error);
    res
      .status(500)
      .json({ message: "Error deleting book", error: error.message });
  }
};

//get a book by id

const getBookById = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.userId;

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
