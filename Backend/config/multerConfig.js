import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinaryConfig.js';
import { v4 as uuidv4 } from 'uuid';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'restaurant-images',
    resource_type: 'image',
    format: async (req, file) => file.mimetype.split('/')[1],
    public_id: (req, file) => {
      const uniqueId = uuidv4();
      return `${file.fieldname}_${uniqueId}`;
    },
    overwrite: false,
    transformation: [
      { width: 1200, height: 675, crop: 'fill' }, // 16:9 aspect ratio
      { quality: 'auto:best' },
      { fetch_format: 'auto' },
    ],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // Increased to 8MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

export { upload };