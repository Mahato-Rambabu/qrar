import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import Restaurant from '../models/restaurant.js';
import authMiddleware from '../middlewares/authMiddlewares.js';
import {upload}  from '../config/multerConfig.js'; // Import multer configuration
import { z } from 'zod';

const router = express.Router();

const restaurantValidationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  number: z.string().length(10, 'Phone number must be 10 digits'),
  address: z.string().min(1, 'Address is required'),
  taxType: z.enum(['inclusive', 'exclusive', 'none']).default('none'),
  taxPercentage: z.preprocess(
      (val) => (val === '' || val === undefined ? 0 : Number(val)),  // Convert empty value to 0
      z.number().min(0, 'Tax percentage must be a positive number').optional()
  )
});

// Ensure FRONTEND_BASE_URL is set
const frontendBaseURL = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

router.post('/register', async (req, res) => {
  try {
      const data = restaurantValidationSchema.parse(req.body);

      const existingRestaurant = await Restaurant.findOne({ email: data.email });
      if (existingRestaurant) {
          return res.status(400).json({ error: 'Email is already registered' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      const newRestaurant = new Restaurant({ 
          ...data, 
          password: hashedPassword,
          taxType: data.taxType,  // Add taxType
          taxPercentage: data.taxPercentage // Add taxPercentage
      });

      const savedRestaurant = await newRestaurant.save();

      const qrCodeUrl = `${frontendBaseURL}/home?restaurantId=${savedRestaurant._id}`;
      const qrCodeImage = await QRCode.toDataURL(qrCodeUrl);

      savedRestaurant.qrCodeUrl = qrCodeUrl;
      savedRestaurant.qrCodeImage = qrCodeImage;
      await savedRestaurant.save();

      res.status(201).json({
          message: 'Restaurant registered successfully',
          restaurant: {
              id: savedRestaurant._id,
              name: savedRestaurant.name,
              qrCodeUrl: savedRestaurant.qrCodeUrl,
              qrCodeImage: savedRestaurant.qrCodeImage,
              taxType: savedRestaurant.taxType,
              taxPercentage: savedRestaurant.taxPercentage
          },
      });
  } catch (error) {
      console.error('Error during registration:', error);
      res.status(400).json({ error: error.message || 'Registration failed' });
  }
});



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
          { expiresIn: '7d' }
      );

      res.status(200).json({
          message: 'Login successful',
          token,
          restaurantId: restaurant._id,
      });
  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error' });
  }
});


router.get('/validate-session', async (req, res) => {
  try {
    // Fix property access
    if (!req.session.restaurant?.id) {
      return res.status(401).json({ isValid: false, error: 'Session invalid' });
    }

    // Optional database check
    const restaurant = await Restaurant.findById(req.session.restaurant.id);
    if (!restaurant) {
      return res.status(401).json({ isValid: false, error: 'Restaurant not found' });
    }

    res.status(200).json({ isValid: true });
  } catch (err) {
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

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const restaurant = await Restaurant.findById(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({
      name: restaurant.name,
      email: restaurant.email,
      number: restaurant.number,
      address: restaurant.address,
      profileImage: restaurant.profileImage,
      bannerImage: restaurant.bannerImage,
      taxType: restaurant.taxType,
      taxPercentage: restaurant.taxPercentage
    });
  } catch (error) {
    console.log('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, number, address } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const restaurant = await Restaurant.findById(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Update only the fields that are provided in the request body
    if (name) restaurant.name = name;
    if (number) restaurant.number = number;
    if (address) restaurant.address = address;

    await restaurant.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      name: restaurant.name,
      number: restaurant.number,
      address: restaurant.address,
    });
  } catch (error) {
    console.log('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to upload profile image
router.post('/profileImage', authMiddleware, upload.single('profileImage'), async (req, res) => {
  try {
    console.log('File received:', req.file);
    const restaurant = await Restaurant.findById(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    restaurant.profileImage = req.file.path; // Log this value
    await restaurant.save();

    res.status(200).json({ message: 'Profile image uploaded successfully', profileImage: restaurant.profileImage });
  } catch (error) {
    console.error('Error while uploading profile image:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Route to upload banner image
router.post('/bannerImage', authMiddleware, upload.single('bannerImage'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    restaurant.bannerImage = req.file.path;
    await restaurant.save();

    
    res.status(200).json({ message: 'Banner image uploaded successfully', bannerImage: restaurant.bannerImage });
  } catch (error) {
    console.log('Error uploading banner image:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to delete profile image
router.delete('/profile-image', authMiddleware, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    restaurant.profileImage = null;
    await restaurant.save();

    res.status(200).json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to delete banner image
router.delete('/banner-image', authMiddleware, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    restaurant.bannerImage = null;
    await restaurant.save();

    res.status(200).json({ message: 'Banner image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to get profile and banner images
router.get('/images', authMiddleware, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.status(200).json({
      profileImage: restaurant.profileImage,
      bannerImage: restaurant.bannerImage,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
router.post('/logout', authMiddleware, (req, res) => {
  try {
    // Clear the client token (handled on the client-side by removing it)
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
// Route to get restaurant profile details by restaurantId (Frontend)
router.get('/profile/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ error: 'Invalid restaurant ID' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.status(200).json({
      name: restaurant.name,
      address: restaurant.address,
      profileImage: restaurant.profileImage,
      bannerImage: restaurant.bannerImage,
      taxType: restaurant.taxType,
      taxPercentage: restaurant.taxPercentage,
    });
  } catch (error) {
    console.error('Error fetching restaurant profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to get profile image by restaurantId
router.get('/images/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ error: 'Invalid restaurant ID' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.status(200).json({
      profileImage: restaurant.profileImage,
      bannerImage: restaurant.bannerImage,
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:restaurantId/manifest.json', async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Validate restaurant ID
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ error: 'Invalid restaurant ID' });
    }

    // Fetch restaurant details
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Image handling with Cloudinary transformations
    let baseImageUrl = restaurant.profileImage || 
      'https://res.cloudinary.com/dasuczqr9/image/upload/v1234/default-image.png';

    // Apply transformations
    const transformation = '/w_192,h_192,c_fill';
    baseImageUrl = baseImageUrl.replace('/upload/', `/upload${transformation}/`);

    // Generate icon URLs
    const icon512 = baseImageUrl.replace(transformation, '/w_512,h_512,c_fill');

    // Define dynamic screenshots for each restaurant
    const homepageScreenshot = `https://res.cloudinary.com/dasuczqr9/image/upload/v1738606735/Screenshot_2025-02-03_at_11.48.38_PM_qxf9em.png`;
    const productPageScreenshot = `https://res.cloudinary.com/dasuczqr9/image/upload/v1738606912/Screenshot_2025-02-03_at_11.50.58_PM_ohqtcx.png`;

    // Manifest configuration
    const manifest = {
      name: restaurant.name || 'Restaurant PWA',
      short_name: restaurant.name?.substring(0,12) || 'Restaurant', // Limit for homescreen
      start_url: `https://qrar-front-jet.vercel.app/home?restaurantId=${restaurantId}&utm_source=pwa`,
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#ff6600',
      icons: [
        {
          src: baseImageUrl,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: icon512,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        }
      ],
      screenshots: [
        {
          src: homepageScreenshot,
          sizes: "2880x1800",
          type: "image/jpeg",
          form_factor: "wide",
        },
        {
          src: productPageScreenshot,
          sizes: "2880x1800",
          type: "image/jpeg",
          
        }
      ]
    };

    // Set security and CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://qrar-front-jet.vercel.app');
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    res.json(manifest);
  } catch (error) {
    console.error('Manifest generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
