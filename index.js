const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const colors = require("colors");
// Load env vars first
dotenv.config();
const session = require("express-session");
const passport = require("./passport");
const userRoutes = require("./routes/userRoutes/userRoutes");
const connectDb = require("./config/connectDb");
const bookRoutes = require("./routes/bookRoute/bookRoutes");
const clientUserRoutes = require("./routes/clientUserRoutes/clientUserRoutes");
const collabtransactionRoutes = require("./routes/transactionRoutes/collabtransaction");
const selftransactionRoutes = require("./routes/transactionRoutes/selfrecord");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/adminRoutes");
const path = require("path");
//databse call
connectDb();
//rest object
const app = express();

//middlewares
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: '*', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Update headers for file serving and frame options
app.use((req, res, next) => {
  // Remove the X-Frame-Options header that's causing the issue
  // res.header('X-Frame-Options', 'SAMEORIGIN');
  
  // Add necessary CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // For PDF files
  if (req.path.match(/\.(pdf)$/i)) {
    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', 'inline');
  }
  
  next();
});

// Trust proxy - required for secure cookies behind a proxy
app.set("trust proxy", 1);

// Add security headers
app.use((req, res, next) => {
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "SAMEORIGIN");
  res.header("X-XSS-Protection", "1; mode=block");
  res.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.header("Referrer-Policy", "strict-origin-when-cross-origin");
  res.header("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
  next();
});

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    name: "apnakhata.sid",
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
      domain: ".hisaabkaro.com",
    },
  })
);
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
app.use('/favicon.png', express.static(path.join(__dirname, 'public', 'favicon.png')));

// Update the static file serving middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'X-Frame-Options': 'ALLOWALL'
      });
    }
  }
}));

// Normalize file paths in responses
app.use((req, res, next) => {
  const oldJson = res.json;
  res.json = function(data) {
    // If the response contains file paths, normalize them
    if (data && data.file) {
      data.file = data.file.replace(/\\/g, '/');
    }
    return oldJson.call(this, data);
  };
  next();
});

//api for authentications
app.use("/api/v1/auth", userRoutes);
app.use("/auth", authRoutes);
//api for books
app.use("/api/v2/transactionBooks", bookRoutes);
//api for clients
app.use("/api/v3/client", clientUserRoutes);
//api for self transactions
app.use("/api/v4/transaction", selftransactionRoutes);
//api for admin dashboard
app.use("/api/v1/admin", adminRoutes);
//api for collab transactions
app.use("/api/collab-transactions", collabtransactionRoutes);

app.get("/backend", (req, res) => {
  res.send("<h1> Welcome to the Expense Management API</h1>");
});

//build location
//build location
// app.use('/favicon.png', express.static(path.join(__dirname, 'public', 'favicon.png')));

app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

//port
const PORT = process.env.PORT || 5100;

//listen server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.bgYellow);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});