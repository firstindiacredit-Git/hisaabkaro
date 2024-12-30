const express = require("express");
const router = express.Router();
const transactionController = require("../../controllers/SelfTransactionController/selfTransactionController");
const authenticate = require("../../middleware/authMiddleware");
const upload = require("../../middleware/uploadSelfTransactionfile");
// Route to create a new transaction
router.post(
  "/create-transaction",
  authenticate,
  upload.single("file"),
  transactionController.createTransaction
);

// Route to get a single transaction by ID
router.get(
  "/get-transaction/:id",
  authenticate,
  transactionController.getTransactionById
);

// Route to get all transactions for a specific user
router.get(
  "/get-transactions/:userId",
  authenticate,
  transactionController.getTransactions
);

// Route to update an existing transaction
router.patch(
  "/transactions/:id/history/:entryId",
  authenticate,
  upload.single("file"),
  transactionController.updateTransaction
);

// Route to delete a transaction by ID
router.delete(
 "/transactions/:id/entries/:entryId",

  transactionController.deleteTransactionEntry
);

router.get("/getbook-transactions/:bookId", authenticate, transactionController.getTransactionsByBookId);
module.exports = router;
  