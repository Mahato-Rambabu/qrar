import express from 'express';
import Category from '../models/category.js';
import Product from '../models/product.js';
import authMiddleware from '../middlewares/authMiddlewares.js';
import {upload} from '../config/multerConfig.js'; // Import multer configuration
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to construct full image URL
const getFullImageUrl = (req, imgPath) => {
  return imgPath ? `${req.protocol}://${req.get('host')}/${imgPath}` : null;
};

// Create a Category with Image Upload
router.post('/', authMiddleware, upload.single('img'), async (req, res) => {
  try {
    const { catName, price } = req.body;

    // If the image file is uploaded, get the file path
    const imgPath = req.file ? req.file.path : null;

    const category = new Category({
      catName,
      img: imgPath, // Save the image path to the database
      price,
      restaurant: req.user.id, // Attach authenticated restaurant
    });

    const savedCategory = await category.save();

    res.status(201).json({
      ...savedCategory.toObject(),
      img: getFullImageUrl(req, savedCategory.img), // Return full image URL
    });
  } catch (error) {
    console.error('Error saving category:', error); // Log full error
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Fetch All Categories for a Restaurant
router.get('/',authMiddleware ,async (req, res) => {
  try {
    const categories = await Category.find({ restaurant: req.user.id });

    // Include full image URLs in the response
    if(!categories || categories.length === 0) {
      return res.status(404).json({ error: 'No categories found' });
    }

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Frontend Fetch All Categories for a Specific Restaurant
router.get('/:restaurantId', async (req, res) => {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    return res.status(400).json({ error: 'Restaurant ID is required' });
  }

  try {
    const categories = await Category.find({ restaurant: restaurantId }).lean();
    if (!categories || categories.length === 0) {
      return res.status(404).json({ error: 'No categories found for this restaurant.' });
    }
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ error: 'Failed to fetch categories. Please try again later.' });
  }
});

// Fetch a Single Category by ID
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the category by ID and ensure it belongs to the authenticated restaurant
    const category = await Category.findOne({ _id: id, restaurant: req.user.id });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json({
      ...category.toObject(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a Category
router.put('/:id', authMiddleware, upload.single('img'), async (req, res) => {
  try {
    const { id } = req.params;
    const { catName, price } = req.body;

    // Check if the category exists and belongs to the authenticated restaurant
    const category = await Category.findOne({ _id: id, restaurant: req.user.id });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Update fields
    category.catName = catName || category.catName;
    category.price = price || category.price;

    // If a new image is uploaded, replace the old one
    if (req.file) {
      category.img = req.file.path;
    }

    const updatedCategory = await category.save();

    res.status(200).json({
      ...updatedCategory.toObject(),
      img: getFullImageUrl(req, updatedCategory.img), // Return full image URL
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete Category with All Products
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const category = await Category.findOne({ _id: id, restaurant: req.user.id });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await Product.deleteMany({ category: id }); // Delete all products in this category
    await category.deleteOne();

    res.status(200).json({ message: 'Category and its products deleted successfully' });
  } catch (error) {
    console.error('Error deleting category and products:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;
