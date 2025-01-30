import express from 'express';
import Product from '../models/product.js';
import Category from '../models/category.js';
import {upload}  from '../config/multerConfig.js'; // Import multer configuration
import authMiddleware from '../middlewares/authMiddlewares.js';
import mongoose from 'mongoose';  

const router = express.Router();

// Add a Product
router.post('/', authMiddleware, upload.single('img'), async (req, res) => {
  try {
    const restaurantId = req.user?.id;

    if (!restaurantId) {
      return res.status(401).json({ error: 'Unauthorized: Restaurant ID missing in token' });
    }

    const { name, price, description, category } = req.body;

    // Check if the category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ error: 'Category not found' });
    }

    // Get Cloudinary's public URL for the uploaded image
    const imgUrl = req.file ? req.file.path : null;

    // Create a new product
    const newProduct = new Product({
      name,
      price,
      description,
      img: imgUrl, // Save Cloudinary public URL
      category,
      restaurant: restaurantId,
    });

    const savedProduct = await newProduct.save();

    // Respond with the newly created product
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error while adding product:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get All Products for a Restaurant (or by Category)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { categoryId, page = 1, limit = 10 } = req.query;
    const filter = categoryId ? { category: categoryId } : {};

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Respond with the products
    res.status(200).json({
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/count', authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const productCount = await Product.countDocuments({restaurant:restaurantId}); // Count all products in the database
    res.status(200).json({ totalProducts: productCount });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Frontend Get All Products for a Restaurant (or by Category)
router.get('/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { categoryId } = req.query; // Optionally filter by category

    // Build the filter based on restaurantId and categoryId
    const filter = { restaurant: restaurantId };
    if (categoryId && categoryId !== 'all') {
      filter.category = categoryId;
    }

    // Fetch products based on the filter
    const products = await Product.find(filter);

    // Directly return the products with their Cloudinary URLs
    res.status(200).json(products.map((product) => product.toObject()));
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get a Single Product by ID
router.get('/:productId', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate('category');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Include full image URL in the response
    res.status(200).json({
      ...product.toObject(),
      img: getFullImageUrl(req, product.img),
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a Product
router.put('/:productId', authMiddleware, upload.single('img'), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    // Validate the category ID
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

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

    // Include full image URL in the response
    res.status(200).json({
      ...updatedProduct.toObject(),
      img: getFullImageUrl(req, updatedProduct.img),
    });
  } catch (error) {
    console.error('Error while updating product:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
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

// Search Suggestions Endpoint
router.get('/search/suggestions', async (req, res) => {
  try {
    const { query, restaurantId } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const filter = {
      name: { $regex: query, $options: 'i' },
    };

    if (restaurantId) {
      filter.restaurant = restaurantId;
    }

    // Ensure categoryId is included in the result
    const suggestions = await Product.find(filter)
      .select('_id name img category') // Include categoryId
      .limit(6);

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;
