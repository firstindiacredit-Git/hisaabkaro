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
    'https://www.hisaabkaro.com',
    'https://hisaabkaro.com',
    'http://localhost:3000',
    'http://localhost:3500',
    'http://localhost:5100',
    'http://192.168.29.66:5100',
    'http://192.168.29.66:3000',
    'http://192.168.1.20:3000',
    'https://admin.hisaabkaro.com',
    'http://localhost:3001'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }

        // Check if the origin is allowed
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));

// Trust proxy - required for secure cookies behind a proxy
app.set('trust proxy', 1);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    name: 'apnakhata.sid',
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
      domain: '.hisaabkaro.com'
    }
  })
);
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
const PORT =  process.env.PORT||5100; 

//listen server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.bgYellow);
}); 
