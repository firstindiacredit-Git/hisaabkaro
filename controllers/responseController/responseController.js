const Transaction = require("../../models/transactionModel/transactionModel");
const Response = require("../../models/responseModel/responseModel");

const addResponse = async (req, res) => {
  try {
    const { transactionId, transactionEntryId, responseMessage } = req.body;

    // Ensure req.user is available (authentication middleware should set this)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Fetch the transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Find the specific transaction entry
    const transactionEntry = transaction.transactionHistory.id(transactionEntryId);
    if (!transactionEntry) {
      return res.status(404).json({ message: "Transaction entry not found" });
    }

    // Ensure initiaterId exists
    if (!transactionEntry.initiaterId) {
      return res.status(400).json({ message: "Transaction initiator not found" });
    }

    // Ensure only the non-initiator can respond
    if (req.user.id.toString() === transactionEntry.initiaterId.toString()) {
      return res.status(403).json({ message: "You cannot respond to your own transaction entry" });
    }

    // Check if a response already exists for this transaction entry
    let existingResponse = await Response.findOne({ transactionId, transactionEntryId });

    // Check if a file was uploaded (multer places file info in req.file)
    const filePath = req.file ? req.file.path : null;

    if (existingResponse) {
      // Update the existing response
      existingResponse.responseMessage = responseMessage;
      if (filePath) {
        existingResponse.file = filePath;
      }
      existingResponse.responseDate = Date.now();

      await existingResponse.save();
      return res.status(200).json({
        message: "Response updated successfully",
        response: existingResponse,
      });
    }

    // Create a new response (include file if provided)
    const newResponse = new Response({
      transactionId,
      transactionEntryId,
      responseMessage,
      file: filePath,
    });

    await newResponse.save();
    return res.status(201).json({
      message: "Response added successfully",
      response: newResponse,
    });
  } catch (error) {
    console.error("Error adding response:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ Get Responses for a Transaction
const getResponsesByTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Fetch responses related to the transaction
    const responses = await Response.find({ transactionId });

    return res.status(200).json({ responses });
  } catch (error) {
    console.error("Error fetching responses:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addResponse, getResponsesByTransaction };
