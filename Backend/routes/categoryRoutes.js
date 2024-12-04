import express from 'express';
import Category from '../models/category.js';
import authMiddleware from '../middlewares/authMiddlewares.js';
import upload from '../config/multerConfig.js'; // Import multer configuration

const router = express.Router();

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

    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch All Categories for a Restaurant
router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find({ restaurant: req.user.id });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch a Single Category by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the category by ID and ensure it belongs to the authenticated restaurant
    const category = await Category.findOne({ _id: id, restaurant: req.user.id });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json(category);
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

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a Category
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the category and ensure it belongs to the authenticated restaurant
    const category = await Category.findOne({ _id: id, restaurant: req.user.id });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.deleteOne();

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
