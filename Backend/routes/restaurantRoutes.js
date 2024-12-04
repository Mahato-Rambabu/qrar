import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Restaurant from '../models/restaurant.js';
import authMiddleware from '../middlewares/authMiddlewares.js';
import { z } from 'zod';  // Make sure you import Zod for validation

const router = express.Router();

// Zod schema for validation
const restaurantValidationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  number: z.string().min(10, 'Phone number must be 10 digits').max(10, 'Phone number must be 10 digits'),
  address: z.string().min(1, 'Address is required'),
});

// Register a Restaurant
router.post('/register', async (req, res) => {
  try {
    // Validate the input data with Zod
    const data = restaurantValidationSchema.parse(req.body);

    const existingRestaurant = await Restaurant.findOne({ email: data.email });
    if (existingRestaurant) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newRestaurant = new Restaurant({ ...data, password: hashedPassword });
    const savedRestaurant = await newRestaurant.save();

    res.status(201).json({ message: 'Restaurant registered successfully', savedRestaurant });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login a Restaurant
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const restaurant = await Restaurant.findOne({ email });
    if (!restaurant) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, restaurant.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: restaurant._id, email: restaurant.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch the Restaurant Dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id).populate('categories');
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
