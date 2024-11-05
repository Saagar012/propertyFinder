const multer = require('multer');
const path = require('path');
const AppError = require("../utils/appError");
const fs = require('fs'); // Import the fs module


// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = `uploads/temp`;
    fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir); 
  },
  filename: (req, file, cb) => {
    // Generate a unique filename: propertyId-timestamp.ext
    const uniqueSuffix = `${Date.now()}-${path.extname(file.originalname)}`;
    cb(null, `${uniqueSuffix}`);
  },
});

// File filter to only allow image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    return cb(new AppError('Only JPEG, PNG, and JPG images are allowed'), 400);
  }
};

// Initialize upload middleware
const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

module.exports = upload;
