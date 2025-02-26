const ClientUser = require("../../models/clientUserModel/clientUserModel");
const Transaction = require("../../models/transactionModel/transactionModel");
const SelfRecord = require("../../models/transactionModel/selfRecordModel");

// Create a new client user
exports.createClientUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, mobile, email } = req.body;

    // Check if the client already exists for this user
    const existingClient = await ClientUser.findOne({
      userId,
      name,
      mobile,
      email,
    });
    if (existingClient) {
      return res
        .status(400)
        .json({ error: "This client already exists for this user" });
    }

    // Create a new ClientUser instance
    const clientUser = await ClientUser.create({
      ...req.body,
      userId: userId
    });

    // Save to database
    await clientUser.save();

    res
      .status(201)
      .json({ message: "Client user created successfully", clientUser });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};


// Get all client users created by the logged-in user
exports.getClientUsers = async (req, res) => {
  try {
    const userId = req.userId;

    // Find all client users associated with the logged-in user
    const clientUsers = await ClientUser.find({ userId });
    res.status(200).json({ success: true, data: clientUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single client user by ID, only if created by the logged-in user
exports.getClientUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const clientUser = await ClientUser.findOne({ _id: id, userId });

    if (!clientUser) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    res.status(200).json({ success: true, data: clientUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a client user, only if created by the logged-in user
exports.updateClientUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { name, mobile, email } = req.body;

    // Update the client user only if it belongs to the logged-in user
    const clientUser = await ClientUser.findOneAndUpdate(
      { _id: id, userId },
      { name, mobile, email },
      { new: true, runValidators: true }
    );

    if (!clientUser) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    res.status(200).json({ success: true, data: clientUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a client user, only if created by the logged-in user
exports.deleteClientUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // First check if the client exists
    const clientUser = await ClientUser.findOne({ _id: id, userId });
    if (!clientUser) {
      return res.status(404).json({ 
        success: false, 
        message: "Client not found" 
      });
    }

    // Delete all associated transactions from both models
    const deleteResults = await Promise.all([
      Transaction.deleteMany({ clientUserId: id }),
      SelfRecord.deleteMany({ clientUserId: id })
    ]);

    const totalTransactionsDeleted = deleteResults[0].deletedCount + deleteResults[1].deletedCount;

    // Delete the client user
    await ClientUser.findOneAndDelete({ _id: id, userId });

    res.status(200).json({ 
      success: true, 
      message: `Client and all associated transactions deleted successfully`,
      details: {
        clientName: clientUser.name,
        transactionsDeleted: totalTransactionsDeleted
      }
    });
  } catch (error) {
    console.error('Error in deleteClientUser:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete client and transactions",
      error: error.message 
    });
  }
};
