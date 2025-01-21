const express = require('express');
const { 
    getDashboardStats, 
    getUsers, 
    deleteUser,
    signup,
    login,
    protect
} = require('../controllers/adminController');

const router = express.Router();

// Auth routes (unprotected)
router.post('/signup', signup);
router.post('/login', login);

// Protected routes (require authentication)
router.use(protect);

// Admin route to get dashboard statistics
router.get('/dashboard', getDashboardStats);

// Admin routes for user management
router.get('/users', getUsers);
router.delete('/users/:userId', deleteUser);

module.exports = router;
