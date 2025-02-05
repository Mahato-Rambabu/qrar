import express from 'express';
import LoyaltyProgram from '../../models/loyalty/loyaltyProgram.js';
import { upload } from '../../config/multerConfig.js';
import authMiddleware from '../../middlewares/authMiddlewares.js';

const router = express.Router();

// Add a new slider image (Seasonal, Category, or Product-based)
router.post('/', authMiddleware, upload.single('img'), async (req, res) => {
  try {
    const { type, categoryId, products } = req.body;
    const restaurantId = req.user.restaurantId;
    const imgPath = req.file ? req.file.path : null;

    if (!imgPath) {
      return res.status(400).json({ error: 'Image is required' });
    }

    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }

    let newSliderImage = {
      img: imgPath,
      restaurantId,
      type,
    };

    if (type === 'category' && categoryId) {
      newSliderImage.categoryId = categoryId;
    } else if (type === 'product' && products && Array.isArray(products)) {
      newSliderImage.products = products.map(p => ({
        productId: p.productId,
        discountPercentage: p.discountPercentage || 0,
      }));
    }

    const savedImage = await LoyaltyProgram.create(newSliderImage);
    res.status(201).json(savedImage);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Fetch all slider images for a restaurant
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const sliderImages = await LoyaltyProgram.find({ restaurantId });

    if (sliderImages.length === 0) {
      return res.status(404).json({ error: 'No images found for this restaurant' });
    }

    res.status(200).json(sliderImages);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch slider images by type (seasonal, category, product)
router.get('/type/:type',authMiddleware ,async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { type } = req.params;
    const sliderImages = await LoyaltyProgram.find({ restaurantId, type });

    res.status(200).json(sliderImages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Delete slider image
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    const sliderImage = await LoyaltyProgram.findOne({ _id: id, restaurantId });
    if (!sliderImage) {
      return res.status(404).json({ error: 'Image not found or unauthorized' });
    }

    await LoyaltyProgram.findByIdAndDelete(id);
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update slider image
router.put('/:id', authMiddleware, upload.single('img'), async (req, res) => {
  try {
    const { id } = req.params;
    const { type, categoryId, products } = req.body;
    const restaurantId = req.user.restaurantId;
    const imgPath = req.file ? req.file.path : null;

    let updateData = { type };
    if (imgPath) updateData.img = imgPath;
    if (type === 'category') updateData.categoryId = categoryId;
    if (type === 'product') {
      updateData.products = products.map(p => ({
        productId: p.productId,
        discountPercentage: p.discountPercentage || 0,
      }));
    }

    const updatedImage = await LoyaltyProgram.findOneAndUpdate(
      { _id: id, restaurantId },
      updateData,
      { new: true }
    );

    if (!updatedImage) {
      return res.status(404).json({ error: 'Image not found or unauthorized' });
    }

    res.status(200).json(updatedImage);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;
