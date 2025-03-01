const Transaction = require("../../models/transactionModel/transactionModel");
const Client = require("../../models/clientUserModel/clientUserModel");
 const notificationapi = require("notificationapi-node-server-sdk").default;
 const Book = require("../../models/bookModel/bookModel");

require("dotenv").config();
notificationapi.init(process.env.NotificationclientId, process.env.NotificationclientSecret);
// Fetch transactions for a user or client
const getTransactions = async (req, res) => {
  try {
    // Assuming the client/user is logged in and their ID is available via the session or token
    const loggedInUserId = req.user.id; // Get from req.user if authenticated via JWT or session

    const transactions = await Transaction.find({
      userId: loggedInUserId,
    })
      .populate({
        path: "userId",
        select: "-password", // Exclude the password field
      })
      .populate("clientUserId bookId") // Populate related user, client, and book details
      .lean({ virtuals: true }); // Include virtual fields like `visibleTransactionType`


    res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
// Fetch transactions for a client
const getTransactionstoclient = async (req, res) => {
  try {
    // Step 1: Find all clients with the same email as the logged-in user
    const clients = await Client.find({ email: req.user.email });
    if (!clients || clients.length === 0) {
     return res.status(200).json({ transactions: [] }); 
    }

    // Collect all client IDs to use in the query
    const clientIds = clients.map((client) => client._id);

    // Step 2: Query the Transaction model to get all transactions related to any of these client IDs
    const transactions = await Transaction.find({
      clientUserId: { $in: clientIds }, // Match transactions where the client is involved
    })
      .populate({
        path: "userId",
        select: "-password", // Exclude the password field
      })
      .populate("clientUserId bookId") // Populate related user, client, and book details
      .lean(); // Returns plain JavaScript objects

      if (!transactions || transactions.length === 0) {
        return res.status(200).json({ transactions: [] });
      }

    res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
// Get a single transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id)
      .populate({
        path: "userId", // Field to populate
        select: "-password", // Exclude the password field
      })
      .populate("clientUserId bookId"); 

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the transaction.",
      error: error.message,
    });
  }
};

const getTransactionsByBookId = async (req, res) => {
  try {
    const { bookId } = req.params;
    if (!bookId) {
      return res.status(400).json({ error: "Book ID is required" });
    }

    const transactions = await Transaction.find({ bookId })
      .populate({
        path: "userId",
        select: "name email",
      })
      .populate({
        path: "clientUserId",
        select: "name email",
      })
      .populate({
        path: "bookId",
        select: "title",
      })
      .sort({ createdAt: -1 }) // Sort by latest transactions
      .lean();

    if (!transactions.length) {
      return res.status(200).json({ success: true, transactions: [] });
    }

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    console.error("Error fetching transactions by book ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getTransactions,
  getTransactionstoclient,
  getTransactionById,
  getTransactionsByBookId,
};
