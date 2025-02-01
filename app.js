const express = require('express');
const path = require('path');
const app = express();

// Add this near the top of your Express app configuration
app.use((req, res, next) => {
  res.header('X-Frame-Options', 'ALLOW-FROM http://localhost:3000');
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
}); 

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// For PDF files specifically
app.get('/uploads/*.pdf', (req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline');
  next();
}); 