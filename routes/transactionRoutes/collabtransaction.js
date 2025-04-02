const express = require("express");
const router = express.Router();
const cors = require("cors");
const {
  getTransactions,
  getTransactionstoclient,
  getTransactionById,
  getTransactionsByBookId,
} = require("../../controllers/collaborativeBookController/collaborativeBookController"); // Adjust path if necessary
const {
  confirmTransaction,
} = require("../../controllers/collaborativeBookController/confirmTransaction");
const {
  updateTransaction,
} = require("../../controllers/collaborativeBookController/updateTransaction");
const {
  deleteTransactionEntry,
} = require("../../controllers/collaborativeBookController/deleteTransactionController");
const {
  addExistingTransaction,
} = require("../../controllers/collaborativeBookController/clientCreateTransaction");
const {
  createTransaction,
} = require("../../controllers/collaborativeBookController/createTransaction");
const { authenticate } = require("../../middleware/authMiddleware");
const upload = require("../../middleware/uploadMiddleware");

// Configure CORS for this router
const corsOptions = {
  origin: ["http://localhost:3000", process.env.REACT_APP_URI],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  optionsSuccessStatus: 204,
};

// Apply CORS to all routes in this router
router.use(cors(corsOptions));

// Handle OPTIONS requests explicitly
router.options("*", cors(corsOptions));

// Add error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error("Transaction route error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
};

// Route to create a new transaction
router.post(
  "/create-transactions",
  authenticate,
  upload.single("file"),
  createTransaction
);
// Route to fetch transactions for a user or client
router.get("/transactions", authenticate, getTransactions);
router.get("/client-transactions", authenticate, getTransactionstoclient);
router.get("/single-transaction/:id", authenticate, getTransactionById);

// Route to fetch transactions for a book
router.get("/transactions/:bookId", getTransactionsByBookId);
// Route to confirm a pending transaction
router.patch("/transactions/:id/confirm", authenticate, confirmTransaction);
router.patch(
  "/transactions/:transactionId/entries/:entryId/confirm",
  authenticate,
  confirmTransaction
);
router.patch(
  "/transactions/:transactionId/entries/:entryId",
  authenticate, // Middleware to ensure the user is authenticated
  upload.single("file"), // Middleware to handle file uploads
  updateTransaction // Controller to handle the update logic
);

router.delete(
  "/transactions/:transactionId/entries/:entryId",
  authenticate,
  deleteTransactionEntry
);
router.post(
  "/transactions/:transactionId/add",
  authenticate,
  upload.single("file"),
  addExistingTransaction
);

// Apply error handling middleware
router.use(errorHandler);

module.exports = router;
