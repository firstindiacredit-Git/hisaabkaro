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
const allowedOrigins = [
  "https://localhost",
  "https://192.168.1.14:3000",
  "http://192.168.1.14:3000", // Allow HTTP for local development
  "https://www.hisaabkaro.com",
  "https://hisaabkaro.com",
  "https://localhost:3000",
  "http://localhost:3000", // Allow HTTP for local development
  "https://localhost:3500",
  "http://localhost:3500", // Allow HTTP for local development
  "https://localhost:5100",
  "http://localhost:5100", // Allow HTTP for local development
  "https://192.168.29.66:5100",
  "http://192.168.29.66:5100", // Allow HTTP for local development
  "https://192.168.29.66:3000",
  "http://192.168.29.66:3000", // Allow HTTP for local development
  "https://192.168.1.3:3000",
  "http://192.168.1.3:3000", // Allow HTTP for local development
  "https://admin.hisaabkaro.com",
  "https://localhost:3001",
  "http://localhost:3001", // Allow HTTP for local development
  "http://10.0.2.2:3000", // Android Studio AVD special localhost
  "http://10.0.2.2:5100", // Android Studio AVD special localhost
  "https://10.0.2.2:3000", // Android Studio AVD special localhost
  "https://10.0.2.2:5100", // Android Studio AVD special localhost
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Capacitor, or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    // Check if the origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRF-Token",
    "X-XSRF-TOKEN",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
    "Cache-Control",
    "Pragma"
  ],
  exposedHeaders: [
    "set-cookie",
    "access-control-allow-origin",
    "access-control-allow-credentials"
  ],
  maxAge: 7200, // 2 hours in seconds
  preflightContinue: false
};

app.use(cors(corsOptions));

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

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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