const express = require('express');
const { getDashboardStats, getUsers, deleteUser } = require('../controllers/adminController');
//const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Admin route to get dashboard statistics
router.get('/dashboard', getDashboardStats);

// Admin routes for user management
router.get('/users', getUsers);
router.delete('/users/:userId', deleteUser);

module.exports = router;
