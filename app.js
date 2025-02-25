const express = require("express");
const path = require("path");
const http = require("http");
const notificationRoutes = require("./routes/notificationRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();
const server = http.createServer(app);

// Add this near the top of your Express app configuration
app.use((req, res, next) => {
  res.header("X-Frame-Options", "ALLOW-FROM http://localhost:3000");
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// For PDF files specifically
app.get("/uploads/*.pdf", (req, res) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline");
  next();
});

// API routes
app.use("/api/notifications", notificationRoutes);
app.use("/api/v3/invoices", invoiceRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
