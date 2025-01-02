const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/userModel/userModel");

// Endpoint to get Google Auth URL
router.get("/google/url", (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.CALLBACK_URL) {
      console.error("Missing required environment variables for Google OAuth");
      return res.status(500).json({
        error: "OAuth configuration error",
        message: "Server is not properly configured for Google authentication",
      });
    }

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${process.env.CALLBACK_URL}&` +
      `response_type=code&` +
      `scope=email profile&` +
      `access_type=offline`;

    res.json({ url: googleAuthUrl });
  } catch (error) {
    console.error("Error generating Google auth URL:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to generate authentication URL",
    });
  }
});

// Google Auth Routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

// Google Auth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.REACT_APP_URI}/login`,
    session: false,
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(
          `${
            process.env.REACT_APP_URI || "http://localhost:5100"
          }/login?error=no_user_data`
        );
      }

      const token = jwt.sign(
        {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          phone: req.user.phone || null,
          picture: req.user.profilePicture || null,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Use REACT_APP_URI for frontend URL
      const frontendUrl = process.env.REACT_APP_URI;
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error("Error in Google callback:", error);
      res.redirect(`${process.env.REACT_APP_URI}/login?error=auth_failed`);
    }
  }
);

// Update profile (including phone)
router.patch("/update-profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { phone, countryCode } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id !== userId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Validate phone number format
    if (!phone || !countryCode) {
      return res.status(400).json({ message: "Phone number and country code are required" });
    }

    // Check if phone number is already in use
    const existingUser = await User.findOne({ phone });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: "Phone number already in use" });
    }

    // Update user's profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        phone,
        countryCode,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new token with updated information
    const newToken = jwt.sign(
      {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        picture: updatedUser.profilePicture || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      success: true, 
      message: "Profile updated successfully",
      token: newToken,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        countryCode: updatedUser.countryCode,
        profilePicture: updatedUser.profilePicture
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// Logout Route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Error logging out" });
    }
    res.redirect(`${process.env.REACT_APP_URI}`);
  });
});

// Check Auth Status
router.get("/status", (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
  });
});

module.exports = router;
