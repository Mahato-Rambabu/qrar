import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinaryConfig.js';
import { v4 as uuidv4 } from 'uuid'; // Import UUID for generating unique IDs

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'restaurant-images', // Name of the folder in Cloudinary
    resource_type: 'image', // Ensure only image uploads
    format: async (req, file) => file.mimetype.split('/')[1], // Dynamically set format based on mimetype
    public_id: (req, file) => {
      const uniqueId = uuidv4(); // Generate a unique ID
      return `${file.originalname.split('.')[0]}_${uniqueId}`; // Append unique ID to the original name
    },
    overwrite: false, // Prevent overwriting existing files
    transformation: [
      { width: 800, height: 800, crop: 'limit' }, // Resize image to a maximum of 800x800 pixels
      { quality: 'auto:good' }, // Automatically optimize quality
      { fetch_format: 'auto' }, // Automatically choose the best format (e.g., WebP)
    ],
  },
});

// Multer middleware with Cloudinary storage
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size of 5MB
});

export { upload };