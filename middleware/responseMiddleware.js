const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/response/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// **Remove fileFilter OR modify it to always allow uploads**
const fileFilter = (req, file, cb) => {
  cb(null, true); // Always allow file uploads, no restrictions
};

// Initialize Multer upload with a 5MB limit
const upload = multer({ 
  storage, 
  fileFilter, 
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB in bytes
  },
});

module.exports = { upload };
