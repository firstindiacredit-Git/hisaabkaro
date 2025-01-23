// userController.js
const User = require("../../models/userModel/userModel");
const { hashPassword, comparePassword } = require("../../helper/hashHelper");
const jwt = require("jsonwebtoken");
const {
  uploadProfilePicture,
} = require("../../middleware/uploadImageMiddleware");
// Signup Function
const signup = async (req, res) => {
  const { name, email, phone, password } = req.body;
  const profilePicture = req.file; // Access the uploaded file
  try {
    // Check if the user already exists (by email or phone)
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password and create a new user
    const hashedPassword = await hashPassword(password);

    // Create user object with optional profile picture
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      profilePicture: profilePicture ? profilePicture.path : null, // Save file path
    });

    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        phone: newUser.phone,
        name: newUser.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data along with token
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        profilePicture: newUser.profilePicture,
      },
      token,
    });
  } catch (error) {
    // Handle Multer file size error
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File size is too large. Maximum allowed size is 5MB.",
      });
    }
    res.status(500).json({ message: "Error signing up user", error });
  }
};

// Login Function
const login = async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    // Validate required fields
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Build query based on provided credentials
    let query = {};
    if (email) {
      query.email = email.toLowerCase();
    } else if (phone) {
      query.phone = phone;
    } else {
      return res
        .status(400)
        .json({ message: "Please provide either email or phone number" });
    }

    // Find the user
    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({ message: "No user found" });
    }
 

    // Compare provided password with stored hashed password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Incorrect password. Please try again" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, phone: user.phone },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Return user data along with token
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "An error occurred during login. Please try again later",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const updateProfile = async (req, res) => {
  const { name, email, phone, password } = req.body;
  const { userId } = req.params; // userId from the URL params (or decoded from JWT token)

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the new email or phone already exists (except for the current user)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email is already taken" });
      }
      user.email = email;
    }

    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res
          .status(400)
          .json({ message: "Phone number is already taken" });
      }
      user.phone = phone;
    }

    // If a password is provided, hash it before updating
    if (password) {
      const hashedPassword = await hashPassword(password);
      user.password = hashedPassword;
    }

    // Update other user details like name
    if (name) user.name = name;

    // If a profile picture is uploaded, save the path
    if (req.file) {
      const profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`;
      user.profilePicture = profilePicturePath;
    }

    // Save the updated user
    await user.save();

    // Return updated user data
    res.status(200).json({
      message: "User profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture, // Include the updated profile picture path
      },
    });
  } catch (error) {
    // Handle Multer file size error
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File size is too large. Maximum allowed size is 5MB.",
      });
    }
    res.status(500).json({ message: "Error updating user profile", error });
  }
};

//get user profile
const getUserProfile = async (req, res) => {
  try {
    // Extract the JWT token from the Authorization header
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    // Verify the token and extract the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find the user by their ID
    const user = await User.findById(userId).select("-password"); // Exclude the password from the response
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Send user profile data
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { signup, login, updateProfile, getUserProfile };
