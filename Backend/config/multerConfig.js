import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinaryConfig.js';

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'restaurant-images', // Name of the folder in Cloudinary
    resource_type: 'image', // Ensure only image uploads
    format: async (req, file) => file.mimetype.split('/')[1], // Dynamically set format based on mimetype
    public_id: (req, file) => file.originalname.split('.')[0], // Use file's original name as public_id
    overwrite: true,
  },
});

// Multer middleware with Cloudinary storage
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size of 5MB
});

export { upload };