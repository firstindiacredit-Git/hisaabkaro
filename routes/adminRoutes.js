const express = require('express');
const { 
    getDashboardStats, 
    getUsers, 
    deleteUser,
    getBooks,
    deleteBook,
    getBooksCreator,
    signup,
    login,
    protect,
    getBookTransactionsCount,
    getUserDetails,
    getUserTransactions
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
router.get('/users', protect, getUsers);
router.get('/users/:userId', protect, getUserDetails);
router.get('/users/:userId/transactions', protect, getUserTransactions);
router.delete('/users/:userId', protect, deleteUser);

// Admin routes for book management
router.get('/books/creator', getBooksCreator);
router.get('/books', getBooks);
router.delete('/books/:bookId', deleteBook);
router.get('/books/:bookId/transactions', getBookTransactionsCount);

module.exports = router;
