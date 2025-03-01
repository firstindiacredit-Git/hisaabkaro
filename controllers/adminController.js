const User = require('../models/userModel/userModel');
const Transaction = require('../models/transactionModel/transactionModel');
const Book = require('../models/bookModel/bookModel');
const Admin = require('../models/adminModel');
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const path = require('path');
const fs = require('fs');

// Create JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024', {
    expiresIn: '7d'
  });
};

// Send JWT token response
const createSendToken = (admin, statusCode, res) => {
  const token = signToken(admin._id);

  // Remove password from output
  admin.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      admin,
    },
  });
};

// Admin signup
const signup = async (req, res) => {
  try {
    const newAdmin = await Admin.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'admin'
    });

    createSendToken(newAdmin, 201, res);
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Admin login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    // Check if admin exists && password is correct
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    // If everything ok, send token to client
    createSendToken(admin, 200, res);
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Protect middleware for admin routes
const protect = async (req, res, next) => {
  try {
    // Get token and check if it exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in! Please log in to get access.",
      });
    }

    // Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024');

    // Check if admin still exists
    const currentAdmin = await Admin.findById(decoded.id);
    if (!currentAdmin) {
      return res.status(401).json({
        status: "fail",
        message: "The admin belonging to this token no longer exists.",
      });
    }

    // Grant access to protected route
    req.admin = currentAdmin;
    next();
  } catch (error) {
    res.status(401).json({
      status: "fail",
      message: "Invalid token or authorization error",
    });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    
    // Get total amount from all confirmed transactions (absolute sum)
    const totalAmountResult = await Transaction.aggregate([
      {
        $unwind: "$transactionHistory"
      },
      {
        $match: {
          "transactionHistory.confirmationStatus": "confirmed"
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$transactionHistory.amount" // Simply sum all amounts without considering transaction type
          }
        }
      }
    ]);
    const totalAmount = totalAmountResult[0]?.total || 0;

    // Get monthly statistics for the current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    // Monthly user registrations
    const monthlyUsers = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Monthly books created
    const monthlyBooks = await Book.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Monthly transactions
    const monthlyTransactions = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Convert aggregation results to arrays with 12 months
    const convertToYearArray = (monthlyData) => {
      const yearArray = new Array(12).fill(0);
      monthlyData.forEach(item => {
        yearArray[item._id - 1] = item.count;
      });
      return yearArray;
    };

    const monthlyStats = {
      users: convertToYearArray(monthlyUsers),
      books: convertToYearArray(monthlyBooks),
      transactions: convertToYearArray(monthlyTransactions)
    };

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBooks,
        totalTransactions,
        totalAmount,
        monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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

// Get user details with transactions
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in getUserDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message
    });
  }
};

// Get user transactions
const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find transactions where the user is either the owner or client
    const transactions = await Transaction.find({
      $or: [
        { userId: userId },  
        { clientUserId: userId }  
      ]
    })
    .populate('bookId', 'bookname')
    .populate('userId', 'name email')
    .populate('clientUserId', 'name email mobile')
    .sort({ createdAt: -1 });

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Transform transactions to match frontend expectations
    const transformedTransactions = [];
    
    transactions.forEach(transaction => {
      if (transaction.transactionHistory && transaction.transactionHistory.length > 0) {
        transaction.transactionHistory.forEach(history => {
          transformedTransactions.push({
            _id: history._id,
            bookId: {
              _id: transaction.bookId._id,
              bookname: transaction.bookId.bookname
            },
            amount: history.amount,
            type: history.transactionType,
            notes: history.description || '',
            createdAt: history.transactionDate,
            createdBy: history.initiatedBy,
            status: history.confirmationStatus,
            outstandingBalance: history.outstandingBalance
          });
        });
      }
    });

    // Sort by date descending
    transformedTransactions.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    // console.log('Found transactions:', transactions.length);
    // console.log('Transformed transactions:', transformedTransactions.length);

    res.status(200).json({
      success: true,
      data: transformedTransactions
    });

  } catch (error) {
    console.error('Error in getUserTransactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user transactions',
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

// Get books with creator information
const getBooksCreator = async (req, res) => {
  try {
    const books = await Book.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'creator'
        }
      },
      {
        $unwind: {
          path: '$creator',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'transactions',
          localField: '_id',
          foreignField: 'bookId',
          as: 'transactions'
        }
      },
      {
        $addFields: {
          membersCount: {
            $size: {
              $setUnion: ['$transactions.clientUserId']
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: '$bookname',
          createdAt: 1,
          updatedAt: 1,
          membersCount: 1,
          'creator._id': 1,
          'creator.name': 1,
          'creator.email': 1,
          status: { $literal: 'Active' }
        }
      },
      {
        $sort: { membersCount: -1, createdAt: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    console.error('Error in getBooks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
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

// Get transactions count by book ID
const getBookTransactionsCount = async (req, res) => {
  try {
    const { bookId } = req.params;

    // Validate if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        status: "fail",
        message: "Book not found"
      });
    }

    // Count transactions for the book
    const transactionsCount = await Transaction.countDocuments({ bookId: bookId });

    // Get count of unique members (clients) in the book
    const uniqueMembers = await Transaction.distinct('clientUserId', { bookId: bookId });
    const membersCount = uniqueMembers.length;

    // Get all unique member details
    const memberDetails = await Transaction.find({ bookId: bookId })
      .populate({
        path: 'clientUserId',
        select: 'name email mobile createdAt'
      })
      .select('clientUserId outstandingBalance')
      .lean();

    // Create a map of member details with their latest outstanding balance
    const memberMap = new Map();
    memberDetails.forEach(transaction => {
      if (transaction.clientUserId) {
        memberMap.set(transaction.clientUserId._id.toString(), {
          name: transaction.clientUserId.name,
          email: transaction.clientUserId.email,
          mobile: transaction.clientUserId.mobile,
          createdAt: transaction.clientUserId.createdAt,
          outstandingBalance: transaction.outstandingBalance
        });
      }
    });

    // Convert map to array
    const members = Array.from(memberMap.values());

    // Get recent transactions (optional, limit to 5)
    const recentTransactions = await Transaction.find({ bookId: bookId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate([
        {
          path: 'userId',
          select: 'name email'
        },
        {
          path: 'clientUserId',
          select: 'name email mobile'
        }
      ])
      .select('transactionHistory outstandingBalance createdAt');

    // Format the recent transactions for better readability
    const formattedTransactions = recentTransactions.map(transaction => ({
      id: transaction._id,
      outstandingBalance: transaction.outstandingBalance,
      createdAt: transaction.createdAt,
      user: transaction.userId ? {
        name: transaction.userId.name,
        email: transaction.userId.email
      } : null,
      client: transaction.clientUserId ? {
        name: transaction.clientUserId.name,
        email: transaction.clientUserId.email,
        mobile: transaction.clientUserId.mobile
      } : null,
      history: transaction.transactionHistory
    }));

    res.status(200).json({
      status: "success",
      data: {
        bookId,
        bookName: book.name || book.bookname,
        transactionsCount,
        membersCount,
        members,
        recentTransactions: formattedTransactions
      }
    });

  } catch (error) {
    console.error('Error in getBookTransactionsCount:', error);
    res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};

module.exports = {
  signup,
  login,
  protect,
  getDashboardStats,
  getUsers,
  getUserDetails,
  getUserTransactions,
  deleteUser,
  getBooks,
  getBooksCreator,
  deleteBook,
  getBookTransactionsCount
};
