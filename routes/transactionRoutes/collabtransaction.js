const express = require("express");
const router = express.Router();
const {
  getTransactions,
  getTransactionstoclient,
  getTransactionById,
  getTransactionsByBookId,
} = require("../../controllers/collaborativeBookController/collaborativeBookController"); // Adjust path if necessary
const { confirmTransaction } = require("../../controllers/collaborativeBookController/confirmTransaction");
const { updateTransaction } = require("../../controllers/collaborativeBookController/updateTransaction");
const { deleteTransactionEntry } = require("../../controllers/collaborativeBookController/deleteTransactionController");
const { addExistingTransaction } = require("../../controllers/collaborativeBookController/clientCreateTransaction");
const { createTransaction } = require("../../controllers/collaborativeBookController/createTransaction");
const {authenticate} = require("../../middleware/authMiddleware");
const upload = require("../../middleware/uploadMiddleware");

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
router.get("/transactions/:bookId",getTransactionsByBookId);
// Route to confirm a pending transaction
router.patch("/transactions/:id/confirm", authenticate, confirmTransaction);
router.patch(
  "/transactions/:transactionId/entries/:entryId/confirm",authenticate,
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

module.exports = router;
