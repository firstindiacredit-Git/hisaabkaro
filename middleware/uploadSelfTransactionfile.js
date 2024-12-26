const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the upload directory exists
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true }); // Create folder and subfolders if necessary
  }
};

const dir = path.join(__dirname, "..", "uploads", "self-transaction");

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDirectoryExists(dir); // Ensure the 'self-transaction' folder exists
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max size
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extName = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Only images and document files are allowed!"));
    }
  },
});

module.exports = upload;
