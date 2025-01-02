const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/userModel/userModel');

// Endpoint to get Google Auth URL
router.get('/google/url', (req, res) => {
    try {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.CALLBACK_URL) {
            console.error('Missing required environment variables for Google OAuth');
            return res.status(500).json({ 
                error: 'OAuth configuration error',
                message: 'Server is not properly configured for Google authentication'
            });
        }

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
            `redirect_uri=${process.env.CALLBACK_URL}&` +
            `response_type=code&` +
            `scope=email profile&` +
            `access_type=offline`;

        res.json({ url: googleAuthUrl });
    } catch (error) {
        console.error('Error generating Google auth URL:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to generate authentication URL'
        });
    }
});

// Google Auth Routes
router.get('/google', (req, res, next) => {
    console.log('Starting Google OAuth flow');
    passport.authenticate('google', {
        scope: ['email', 'profile'],
        accessType: 'offline',
        prompt: 'consent',
        state: true
    })(req, res, next);
});

// Google Auth Callback
router.get('/google/callback',
    (req, res, next) => {
        console.log('Received callback from Google');
        passport.authenticate('google', { 
            failureRedirect: `${process.env.REACT_APP_URI}/login?error=auth_failed`,
            failureMessage: true 
        })(req, res, next);
    },
    async (req, res) => {
        try {
            console.log('Processing Google callback');
            
            if (!req.user) {
                console.error('No user data in request');
                return res.redirect(`${process.env.REACT_APP_URI}/login?error=no_user_data`);
            }

            // Generate JWT token
            const tokenPayload = {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                hasPhone: !!req.user.phone,
                picture: req.user.profilePicture || null
            };

            console.log('Creating token with payload:', tokenPayload);

            const token = jwt.sign(
                tokenPayload,
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Set CORS headers explicitly for the callback
            res.header('Access-Control-Allow-Origin', process.env.REACT_APP_URI);
            res.header('Access-Control-Allow-Credentials', 'true');

            // Clear the session after generating token
            req.logout(() => {
                const cleanBaseUrl = process.env.REACT_APP_URI.replace(/\/$/, '');
                const redirectUrl = `${cleanBaseUrl}/auth/google/callback?token=${token}`;
                
                console.log('Redirecting to:', redirectUrl);
                res.redirect(redirectUrl);
            });
        } catch (error) {
            console.error('Error in Google callback:', error);
            res.redirect(`${process.env.REACT_APP_URI}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
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
