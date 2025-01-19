import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cors from "cors";
import sliderImages from './routes/sliderImages.js';
import configureOrderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import QrCodeGen from './routes/QrCodeGen.js';
import initializeSocket from './sockets/socket.js';
import http from 'http';
import cookieParser from 'cookie-parser';
import validateCustomer from './middlewares/validateCustomer.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Create an HTTP server instance
const server = http.createServer(app);

// Initialize Socket.IO with the server instance
const io = initializeSocket(server);

app.use(
  cors({
    origin: "https://qrar-lyart.vercel.app/", // Allow your Vercel frontend URL
    credentials: true, // Allow cookies to be sent
  })
);


app.use(cookieParser()); 
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// MongoDB Connection
connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/restaurants', restaurantRoutes,);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/imageSlider', sliderImages);
app.use('/orders', configureOrderRoutes(io), validateCustomer);
app.use('/users', userRoutes);
app.use('/', QrCodeGen);

// Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
