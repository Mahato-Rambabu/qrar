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

app.use(cookieParser()); 
app.use(express.json());

app.use(cors({
    origin: ["https://qrar-lyart.vercel.app", "https://qrar-front-jet.vercel.app"],
    credentials: true,  
}));

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
app.use('/orders', configureOrderRoutes(io));
app.use('/users', userRoutes);
app.use('/', QrCodeGen);

// Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

orderRoutes
//routes for pending orders
  router.get("/pending", authMiddleware, async (req, res) => {
    try {
      const restaurantId = req.user.id;
      const { dateRange } = req.query; // Extract the dateRange query parameter
  
      if (!isValidObjectId(restaurantId)) {
        return res.status(400).json({ error: "Invalid restaurant ID." });
      }
  
      const startDate = getDateRange(dateRange); // Use the getDateRange helper
      if (!startDate) {
        console.error("Invalid date range");
        return res.status(400).json({ error: "Invalid date range." });
      }
  
      // Fetch pending orders within the date range
      const pendingOrders = await Order.find({
        restaurantId,
        status: "Pending",
        createdAt: { $gte: startDate }, // Filter by startDate
      })
        .populate("customerIdentifier", "name")
        .populate("items.productId", "name description img")
        .select("orderNo total items status createdAt customerIdentifier")
        .sort({ createdAt: -1 });
  
      const transformedOrders = pendingOrders.map((order) => ({
        ...order.toObject(),
        customerName: order.customerIdentifier?.name || "Unknown",
      }));
  
      res.status(200).json(transformedOrders);
    } catch (error) {
      console.error("Error fetching pending orders:", error.message);
      res.status(500).json({ error: "Failed to fetch pending orders. Please try again later." });
    }
  });
