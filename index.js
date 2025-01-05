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
    'http://localhost:5100'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }

        // Check if the origin is allowed
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            // Check exact match
            if (origin === allowedOrigin) return true;
            // Check if it's a subdomain of an allowed domain
            if (origin.endsWith('.hisaabkaro.com')) return true;
            return false;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.error('CORS blocked for origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["set-cookie"],
    preflightContinue: true,
    optionsSuccessStatus: 204
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

//api for authentications
app.use("/api/v1/auth", userRoutes);
app.use("/auth", authRoutes); 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//api for books
app.use("/api/v2/transactionBooks", bookRoutes);
//api for clients
app.use("/api/v3/client", clientUserRoutes);
//api for self transactions
app.use("/api/v4/transaction", selftransactionRoutes);

//api for collab transactions
app.use("/api/collab-transactions", collabtransactionRoutes);

app.get("/backend", (req, res) => {
  res.send("<h1> Welcome to the Expense Management API</h1>");
});

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