// productRoutes.js
import express from 'express';
import Product from '../models/product.js';
import Category from '../models/category.js';
import upload from '../config/multerConfig.js'; // Import multer configuration
import authMiddleware from '../middlewares/authMiddlewares.js';

const router = express.Router();

// Create a Product
router.post('/', authMiddleware, upload.single('img'), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    // Check if the category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ error: 'Category not found' });
    }

    // If an image is uploaded, get the file path
    const imgPath = req.file ? req.file.path : null;

    const newProduct = new Product({
      name,
      price,
      description,
      img: imgPath,
      category,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get All Products for a Restaurant (or by Category)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { categoryId } = req.query; // Optionally filter by category

    const products = categoryId
      ? await Product.find({ category: categoryId }) // Filter by category if provided
      : await Product.find();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a Single Product by ID
router.get('/:productId', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate('category');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a Product
router.put('/:productId', authMiddleware, upload.single('img'), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    // If an image is uploaded, get the file path
    const imgPath = req.file ? req.file.path : null;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        name,
        price,
        description,
        img: imgPath || undefined, // Only update the image if provided
        category,
      },
      { new: true, runValidators: true } // Ensure MongoDB validation runs
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a Product
router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
