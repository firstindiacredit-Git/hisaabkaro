const User = require('../models/userModel/userModel');
const Transaction = require('../models/transactionModel/transactionModel');
const Book = require('../models/bookModel/bookModel');
const path = require('path');
const fs = require('fs');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        // Get users with their details
        const users = await User.find({}, {
            createdAt: 1,
            name: 1,
            email: 1,
            phone: 1
        }).sort({ createdAt: -1 });
        // Get total number of users
        const totalUsers = users.length;
        // Get total number of books
        const totalBooks = await Book.countDocuments();
        // Get total number of transactions
        const totalTransactions = await Transaction.countDocuments();

        // Calculate total amount from all transactions
        const transactions = await Transaction.find({});
        const totalAmount = transactions.reduce((sum, transaction) => sum + Math.abs(transaction.outstandingBalance || 0), 0);

        // Get recent users (joined in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentUsers = users.filter(user => new Date(user.createdAt) > sevenDaysAgo);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalBooks,
                totalTransactions,
                totalAmount,
                recentUsers: recentUsers.slice(0, 5) // Send only first 5 recent users
            }
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting dashboard statistics',
            error: error.message
        });
    }
};

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, {
            name: 1,
            email: 1,
            phone: 1,
            profilePicture: 1,
            createdAt: 1
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                users
            }
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting users',
            error: error.message
        });
    }
};

// Delete user and their data
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete user's profile picture if exists
        if (user.profilePicture) {
            const picturePath = path.join(__dirname, '..', user.profilePicture);
            if (fs.existsSync(picturePath)) {
                fs.unlinkSync(picturePath);
            }
        }

        // Delete user's transactions
        await Transaction.deleteMany({ userId: userId });

        // Delete user's books
        await Book.deleteMany({ userId: userId });

        // Finally delete the user
        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: 'User and all associated data deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

// Get all books with pagination, search and sorting
const getBooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';

        // Build search query
        const searchQuery = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        } : {};

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Build sort object
        const sort = {};
        sort[sortField] = sortOrder === 'desc' ? -1 : 1;

        // Get books with pagination and populate user details
        const books = await Book.find(searchQuery)
            .populate('userId', 'name email phone')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('name description userId createdAt updatedAt totalAmount totalTransactions');

        // Get total count for pagination
        const totalBooks = await Book.countDocuments(searchQuery);

        res.json({
            success: true,
            data: {
                books,
                pagination: {
                    total: totalBooks,
                    page,
                    limit,
                    totalPages: Math.ceil(totalBooks / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting books:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting books',
            error: error.message
        });
    }
};

// Delete book and its transactions
const deleteBook = async (req, res) => {
    try {
        const { bookId } = req.params;

        // Check if book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Delete book's transactions
        await Transaction.deleteMany({ bookId: bookId });

        // Delete the book
        await Book.findByIdAndDelete(bookId);

        res.json({
            success: true,
            message: 'Book and all associated transactions deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting book',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getUsers,
    deleteUser,
    getBooks,
    deleteBook
};
