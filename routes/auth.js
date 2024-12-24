const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/userModel/userModel');

// Google Auth Routes
router.get('/google',
    passport.authenticate('google', {
        scope: ['email', 'profile']
    })
);

// Google Auth Callback
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.REACT_APP_URI}/login` }),
    (req, res) => {
        try {
            // Generate JWT token
            const token = jwt.sign(
                {
                    id: req.user._id,
                    email: req.user.email,
                    name: req.user.name,
                    hasPhone: !!req.user.phone // Add flag to check if phone exists
                },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Redirect to frontend with token
            res.redirect(`${process.env.REACT_APP_URI}/home?token=${token}`);
        } catch (error) {
            console.error('Error in Google callback:', error);
            res.redirect(`${process.env.REACT_APP_URI}/login?error=authentication_failed`);
        }
    }
);

// Update phone number
router.patch('/update-phone', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { phone } = req.body;

        // Validate phone number
        if (!phone || !/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Invalid phone number' });
        }

        // Check if phone number is already in use
        const existingUser = await User.findOne({ phone });
        if (existingUser && existingUser._id.toString() !== decoded.id) {
            return res.status(400).json({ message: 'Phone number already in use' });
        }

        // Update user's phone number
        await User.findByIdAndUpdate(decoded.id, { phone });

        res.json({ success: true, message: 'Phone number updated successfully' });
    } catch (error) {
        console.error('Error updating phone number:', error);
        res.status(500).json({ message: 'Error updating phone number' });
    }
});

// Logout Route
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error logging out' });
        }
        res.redirect(`${process.env.REACT_APP_URI}`);
    });
});

// Check Auth Status
router.get('/status', (req, res) => {
    res.json({
        isAuthenticated: req.isAuthenticated(),
        user: req.user
    });
});

module.exports = router;
