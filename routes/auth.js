const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel/userModel');
const router = express.Router();

// Middleware for checking environment variables
function checkEnvVars(req, res, next) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.CALLBACK_URL || !process.env.REACT_APP_URI || !process.env.JWT_SECRET) {
        console.error('Missing required environment variables');
        return res.status(500).json({ error: 'Server is not properly configured for authentication' });
    }
    next();
}

// Endpoint to get Google Auth URL
router.get('/google/url', checkEnvVars, (req, res) => {
    try {
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
            `redirect_uri=${process.env.CALLBACK_URL}&` +
            `response_type=code&` +
            `scope=email profile&` +
            `access_type=offline`;
        
        res.json({ url: googleAuthUrl });
    } catch (error) {
        console.error('Error generating Google auth URL:', error);
        res.status(500).json({ error: 'Failed to generate authentication URL' });
    }
});

// Google Auth Routes
router.get('/google', checkEnvVars, (req, res, next) => {
    passport.authenticate('google', {
        scope: ['email', 'profile'],
        accessType: 'offline',
        prompt: 'consent',
        state: true
    })(req, res, next);
});

// Google Auth Callback
// Google Auth Callback
router.get('/google/callback', checkEnvVars,
    async (req, res, next) => {
        passport.authenticate('google', {
            failureRedirect: `${process.env.REACT_APP_URI}/login`,
            failureMessage: true
        })(req, res, next);
    },
    async (req, res) => {
        try {
            if (!req.user) {
                console.error('No user data in request');
                return res.redirect(`${process.env.REACT_APP_URI}/login?error=no_user_data`);
            }

            const tokenPayload = {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                hasPhone: !!req.user.phone,
                picture: req.user.profilePicture || null
            };

            const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

            // Use callback in req.logout() to ensure it completes before continuing
            req.logout((err) => {
                if (err) {
                    console.error('Logout error:', err);
                    return res.redirect(`${process.env.REACT_APP_URI}/login?error=logout_failed`);
                }

                // After logout, redirect to the appropriate URL
                const cleanBaseUrl = process.env.REACT_APP_URI.replace(/\/$/, '');
                const redirectUrl = `${cleanBaseUrl}/auth/google/callback?token=${token}`;
                res.redirect(redirectUrl);
            });
        } catch (error) {
            console.error('Error in Google callback:', error);
            res.redirect(`${process.env.REACT_APP_URI}/login?error=auth_failed`);
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

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        const { phone } = req.body;

        // Validate phone number
        if (!phone || !/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Invalid phone number' });
        }

        // Check if phone number is already in use
        const existingUser = await User.findOne({ phone });
        if (existingUser && !existingUser._id.equals(decoded.id)) {
            return res.status(400).json({ message: 'Phone number already in use' });
        }

        await User.findByIdAndUpdate(decoded.id, { phone });
        res.json({ success: true, message: 'Phone number updated successfully' });
    } catch (error) {
        console.error('Error updating phone number:', error);
        res.status(500).json({ message: 'Error updating phone number' });
    }
});

// Logout Route
router.get('/logout', async (req, res) => {
    try {
        await req.logout();
        res.redirect(process.env.REACT_APP_URI);
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ error: 'Error logging out' });
    }
});

// Check Auth Status
router.get('/status', (req, res) => {
    res.json({
        isAuthenticated: req.isAuthenticated(),
        user: req.user || null
    });
});

module.exports = router;
