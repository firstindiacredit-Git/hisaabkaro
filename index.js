const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const colors = require("colors");
const http = require("http");
const { Server } = require("socket.io");
const socketService = require("./services/socketService");
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
const authRoutes = require("./routes/googleAuth/auth");
const adminRoutes = require("./routes/adminRoutes/adminRoutes");
const path = require("path");
const upload = require("multer")();
const notificationRoutes = require("./routes/notificationRoutes/notificationRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes/invoiceRoutes");
const fcmRoutes = require("./routes/fcmRoutes/fcmRoutes");
const messageRoutes = require("./routes/messageRoutes/messageRoutes");  
const passwordRoutes = require("./routes/passwordRoute/passwordRoute");
const noteRoutes = require("./routes/noteRoutes/noteRoutes");

const mongoose = require("mongoose");
//databse call
connectDb()
  // .then(() => {
  //   console.log("MongoDB connection established successfully".green);
  //   // Log the connection state periodically
  //   setInterval(() => {
  //     const state = mongoose.connection.readyState;
  //     const states = [
  //       "disconnected",
  //       "connected",
  //       "connecting",
  //       "disconnecting",
  //     ];
            
  //   }, 30000); // Check every 30 seconds
  // })
  // .catch((err) => {
  //   console.error("MongoDB connection error:".red, err);
  //   process.exit(1); // Exit if we can't connect to the database
  // });

// Add mongoose connection error handlers
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:".red, err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected".yellow);
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected".green);
});

//rest object
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://:3000", "http://localhost:3500", process.env.REACT_APP_URI],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  },
  transports: ["websocket", "polling"],
  path: "/socket.io/",
});

// Initialize socket service
socketService.init(io);

//middlewares
app.use(express.json());

// CORS configuration - place this before any routes
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3500", process.env.REACT_APP_URI],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  exposedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests for all routes
app.options('*', cors());

// Trust proxy - required for secure cookies behind a proxy
app.set("trust proxy", 1);

// Add security headers
app.use((req, res, next) => {
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "SAMEORIGIN");
  res.header("X-XSS-Protection", "1; mode=block");
  res.header(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
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
app.use(
  "/favicon.png",
  express.static(path.join(__dirname, "public", "favicon.png"))
);

// Update the static file serving middleware
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".pdf")) {
        res.set({
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline",
          "X-Frame-Options": "ALLOWALL",
        });
      }
    },
  })
);

// Normalize file paths in responses
app.use((req, res, next) => {
  const oldJson = res.json;
  res.json = function (data) {
    // If the response contains file paths, normalize them
    if (data && data.file) {
      data.file = data.file.replace(/\\/g, "/");
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
app.use("/api/notifications", notificationRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/passwords", passwordRoutes);
app.use("/api/users", userRoutes);
//api for chat
app.use("/api/messages", messageRoutes);
// FCM routes
app.use("/api/fcm", fcmRoutes);
app.use("/api/v1/notes", noteRoutes);

// Add this endpoint to handle PDF uploads
app.post("/api/upload-pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Generate a public URL for the uploaded file
    const fileUrl = `/uploads/transactions/${req.file.filename}`;

    res.json({
      success: true,
      fileUrl,
      message: "PDF uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading PDF:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading PDF",
    });
  }
});

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
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.bgYellow);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Export the server for potential testing
module.exports = server;
