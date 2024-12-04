// multerConfig.js
import multer from 'multer';
import path from 'path';

// Set storage destination and filename for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the uploads folder to save files
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    // Set the filename for uploaded files (e.g., original name + timestamp)
    const fileExtension = path.extname(file.originalname);
    const fileName = `${Date.now()}${fileExtension}`;
    cb(null, fileName);
  },
});

// Multer filter to accept only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .jpeg, .png, and .gif are allowed.'));
  }
};

// Create the upload middleware with the above storage and filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size of 5MB
});

export default upload;
