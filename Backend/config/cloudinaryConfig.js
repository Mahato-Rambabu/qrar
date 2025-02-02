import { v2 as cloudinary } from 'cloudinary';
import { config} from 'dotenv';
import path from 'path';

// Ensure dotenv is configured before using environment variables
const environment = process.env.NODE_ENV || 'development';

// Load the corresponding .env file
config({ path: path.resolve(process.cwd(), `.env.${environment}`) });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export default cloudinary;
