const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  // Allow OPTIONS requests to pass through
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Token is missing.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    };
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    console.log("Authenticated user:", {
      id: decoded.id,
      email: decoded.email
    });
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const protect = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized, no token'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Not authorized, token failed'
    });
  }
};

module.exports = { authenticate, protect };
