const Password = require("../../models/passwordModel/passwordModel");
 

// Get all passwords for a user
exports.getPasswords = async (req, res) => {
  try {
    const passwords = await Password.find({ userId: req.user.id });
    res.json(passwords);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching passwords", error: error.message });
  }
};

// Add a new password
exports.addPassword = async (req, res) => {
  try {
    const { website, url, username, password, notes } = req.body;

    // Create new password entry
    const newPassword = new Password({
      userId: req.user.id,
      website,
      url,
      username,
      password,
      notes,
    });

    const savedPassword = await newPassword.save();
    res.status(201).json(savedPassword);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding password", error: error.message });
  }
};

// Update a password
exports.updatePassword = async (req, res) => {
  try {
    const { website, url, username, password, notes } = req.body;
    const updatedPassword = await Password.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { website, url, username, password, notes },
      { new: true }
    );

    if (!updatedPassword) {
      return res.status(404).json({ message: "Password not found" });
    }

    res.json(updatedPassword);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating password", error: error.message });
  }
};

// Delete a password
exports.deletePassword = async (req, res) => {
  try {
    const deletedPassword = await Password.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deletedPassword) {
      return res.status(404).json({ message: "Password not found" });
    }

    res.json({ message: "Password deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting password", error: error.message });
  }
};

// Search passwords
exports.searchPasswords = async (req, res) => {
  try {
    const searchTerm = req.query.term;
    const passwords = await Password.find({
      userId: req.user.id,
      website: { $regex: searchTerm, $options: "i" },
    });

    res.json(passwords);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching passwords", error: error.message });
  }
};
