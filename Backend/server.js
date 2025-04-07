import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cors from 'cors';
import updatedSliderImages from './routes/loyalty/updatedSliderImage.js';
import offer from './routes/loyalty/offer.js';
import popUp from './routes/loyalty/popUp.js'
import couponCode from './routes/loyalty/couponCode.js'
import comboDealRoutes from './routes/loyalty/comboDealsRoutes.js'
import sliderImages from './routes/sliderImages.js'
import configureOrderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import QrCodeGen from './routes/QrCodeGen.js';
import initializeSocket from './sockets/socket.js';
import http from 'http';
import cookieParser from 'cookie-parser';

// Determine the current environment (default to 'development')
const environment = process.env.NODE_ENV || 'development';
config({ path: path.resolve(process.cwd(), `.env.${environment}`) });

console.log(`Environment: ${environment}`);
console.log(`Frontend URL: ${process.env.FRONTEND_BASE_URL}`); // Debug

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

app.use(cookieParser());
app.use(express.json());



const allowedOrigins = [
  'https://qrar-lyart.vercel.app', 
  'https://qrar-front-jet.vercel.app', 
  'http://localhost:5174',
  'http://localhost:5173',
];


// 🔹 Ensure Response Headers Include Credentials
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // 🔥 Required for sending cookies
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// MongoDB Connection
connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/restaurants', restaurantRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/imageSlider', sliderImages);
app.use('/coupon', couponCode);
app.use('/updatedImageSlider', updatedSliderImages);
app.use('/offer', offer);
app.use('/popups', popUp);
app.use('/combo-deals', comboDealRoutes);
app.use('/orders', configureOrderRoutes(io));
app.use('/users', userRoutes);
app.use('/', QrCodeGen);

// Server
const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));