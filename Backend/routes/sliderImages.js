import express from 'express';
import SliderImage from '../models/sliderImage.js';
import {upload} from '../config/multerConfig.js'; // Import multer configuration
import authMiddleware from '../middlewares/authMiddlewares.js';

const router = express.Router();

// Add a new image
router.post('/', authMiddleware, upload.single('img'), async (req, res) => {
  try {
    const imgPath = req.file ? req.file.path : null; // Cloudinary URL

    if (!imgPath) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Extract restaurantId from req.user (set in authMiddleware)
    const restaurantId = req.user.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    // Create and save the slider image
    const sliderImage = new SliderImage({
      img: imgPath, // Cloudinary URL
      restaurantId, // Assigning from authMiddleware
    });

    const savedImage = await sliderImage.save();
    res.status(201).json(savedImage);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});


// Fetch slider images for a specific restaurant
router.get('/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const sliderImages = await SliderImage.find({ restaurantId });

    if (sliderImages.length === 0) {
      return res.status(404).json({ error: 'No images found for this restaurant' });
    }

    res.status(200).json(sliderImages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete slider image
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId; // Extract from token

    const sliderImage = await SliderImage.findOne({ _id: id, restaurantId });
    if (!sliderImage) {
      return res.status(404).json({ error: 'Image not found or unauthorized' });
    }

    await SliderImage.findByIdAndDelete(id);
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update slider image
router.put('/:id', authMiddleware, upload.single('img'), async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId; // Extract from token
    const imgPath = req.file ? req.file.path : null;

    if (!imgPath) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const sliderImage = await SliderImage.findOne({ _id: id, restaurantId });
    if (!sliderImage) {
      return res.status(404).json({ error: 'Image not found or unauthorized' });
    }

    const updatedImage = await SliderImage.findByIdAndUpdate(
      id,
      { img: imgPath },
      { new: true }
    );

    res.status(200).json(updatedImage);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;
