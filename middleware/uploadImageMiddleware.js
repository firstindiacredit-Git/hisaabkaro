const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Profile picture storage
const profilePictureStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Go up one level from the current directory (__dirname) and then create the path to uploads/profile-pictures
      const dir = path.join(__dirname, "..", "uploads", "profile-pictures"); 
  
      // Ensure the directory exists, create it if not
      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {
          return cb(err);
        }
        cb(null, dir); // Save the file in the "profile-pictures" folder
      });
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  });
// Profile picture upload with 5 MB limit and image type validation
const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

module.exports = {
  uploadProfilePicture,
};
