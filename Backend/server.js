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
import session from 'express-session';
import MongoStore from 'connect-mongo';
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
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 7 * 24 * 60 * 60 // 7 days
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // MUST be true if sameSite='None'
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      // Remove domain: '.onrender.com' (causes cross-origin issues)
    }
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
app.use('/orders', configureOrderRoutes(io));
app.use('/users', userRoutes);
app.use('/', QrCodeGen);



// Server
const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));