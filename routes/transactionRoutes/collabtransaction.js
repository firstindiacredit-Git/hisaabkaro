const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  confirmTransaction,
  getTransactionstoclient,
  getTransactionById,
  addExistingTransaction,
  updateTransaction,
  deleteTransactionEntry,
} = require("../../controllers/collaborativeBookController/collaborativeBookController"); // Adjust path if necessary

const authenticate = require("../../middleware/authMiddleware");
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
// Route to confirm a pending transaction
router.patch("/transactions/:id/confirm", confirmTransaction);
router.patch(
  "/transactions/:transactionId/entries/:entryId/confirm",
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
