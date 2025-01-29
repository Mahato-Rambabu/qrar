import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cors from 'cors';
import sliderImages from './routes/sliderImages.js';
import configureOrderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import QrCodeGen from './routes/QrCodeGen.js';
import initializeSocket from './sockets/socket.js';
import http from 'http';
import cookieParser from 'cookie-parser';

// Determine the current environment (default to 'development')
const environment = process.env.NODE_ENV || 'development';

// Load the corresponding .env file
config({ path: path.resolve(process.cwd(), `.env.${environment}`) });

console.log(`Environment: ${environment}`);
console.log(`Frontend url: ${process.env.FRONTEND_BASE_URL}`); // Debug to confirm the correct .env is loaded

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Create an HTTP server instance
const server = http.createServer(app);

// Initialize Socket.IO with the server instance
const io = initializeSocket(server);

app.use(cookieParser());
app.use(express.json());

// CORS Setup: Dynamically configure allowed origins based on the environment
const allowedOrigins = [
  'https://qrar-lyart.vercel.app', // Your Vercel frontend URL
  'https://qrar-front-jet.vercel.app', // Another Vercel frontend URL
  'http://localhost:5173', // Allow localhost for development
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Allow credentials (cookies)
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Ensure headers are allowed
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // ✅ Allow all methods
  })
);

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// MongoDB Connection
connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/restaurants', restaurantRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/imageSlider', sliderImages);
app.use('/orders', configureOrderRoutes(io));
app.use('/users', userRoutes);
app.use('/', QrCodeGen);

// Server
const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));