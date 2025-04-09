import express from 'express';
import SliderImage from '../../models/sliderImage.js';
import { upload } from '../../config/multerConfig.js';
import authMiddleware from '../../middlewares/authMiddlewares.js';

const router = express.Router();

// Add a new slider image
router.post('/', authMiddleware, upload.single('img'), async (req, res) => {
  try {
    const { offer } = req.body;
    const restaurantId = req.user.restaurantId;
    const imgPath = req.file ? req.file.path : null;

    if (!imgPath) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const newSliderImage = {
      img: imgPath,
      restaurantId,
      ...(offer && { offer }), // Only include offer if it exists
    };

    const savedSlider = await SliderImage.create(newSliderImage);
    res.status(201).json(savedSlider);
  } catch (error) {
    console.error('Error creating slider image:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Fetch all slider images for a restaurant
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const sliderImages = await SliderImage.find({ restaurantId })
      .populate('offer', 'title startTime endTime'); // Populate offer details if exists

    res.status(200).json(sliderImages);
  } catch (error) {
    console.error('Error fetching slider images:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Delete a slider image
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    const sliderImage = await SliderImage.findOne({ _id: id, restaurantId });
    if (!sliderImage) {
      return res.status(404).json({ error: 'Slider image not found or unauthorized' });
    }

    await SliderImage.findByIdAndDelete(id);
    res.status(200).json({ message: 'Slider image deleted successfully' });
  } catch (error) {
    console.error('Error deleting slider image:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;
