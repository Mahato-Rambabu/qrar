import express from 'express';
import PopUpImage from '../../models/loyalty/popUp.js';
import { upload } from '../../config/multerConfig.js'; // Multer for file upload
import authMiddleware from '../../middlewares/authMiddlewares.js';

const router = express.Router();

// ✅ Add a new pop-up image
router.post('/', authMiddleware, upload.single('img'), async (req, res) => {
  try {
    const { name } = req.body;
    const restaurantId = req.user.restaurantId; // Get restaurant ID from token
    const imgPath = req.file ? req.file.path : null;

    if (!name || !imgPath) {
      return res.status(400).json({ error: 'Name and image are required' });
    }

    // Create and save the pop-up image
    const newPopUp = new PopUpImage({
      name,
      img: imgPath,
      restaurantId,
      isActive: false // Default: Not active
    });

    const savedPopUp = await newPopUp.save();
    res.status(201).json(savedPopUp);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// ✅ Fetch all pop-up images for a restaurant
router.get('/',authMiddleware, async (req, res) => {
    try {
      const restaurantId = req.user.restaurantId; // Get restaurant ID from token
      const popUpImages = await PopUpImage.find({ restaurantId });
  
      if (popUpImages.length === 0) {
        return res.status(404).json({ error: 'No pop-up images found' });
      }
  
      res.status(200).json(popUpImages);
    } catch (error) {
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  });
  
  // ✅ Fetch the active pop-up image for a restaurant
router.get('/active',authMiddleware, async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId; // Get restaurant ID from token
      const activePopUp = await PopUpImage.findOne({ restaurantId, isActive: true });
  
      if (!activePopUp) {
        return res.status(404).json({ error: 'No active pop-up image found' });
      }
  
      res.status(200).json(activePopUp);
    } catch (error) {
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  });

  // ✅ Toggle pop-up image active state (Only one can be active at a time)
router.put('/toggle/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const restaurantId = req.user.restaurantId;
  
      // Find the pop-up image to activate
      const popUpToActivate = await PopUpImage.findOne({ _id: id, restaurantId });
      if (!popUpToActivate) {
        return res.status(404).json({ error: 'Pop-up image not found' });
      }
  
      if (popUpToActivate.isActive) {
        // If already active, deactivate it
        popUpToActivate.isActive = false;
        await popUpToActivate.save();
        return res.status(200).json({ message: 'Pop-up image deactivated', popUpToActivate });
      }
  
      // Deactivate any currently active pop-up image
      await PopUpImage.updateMany({ restaurantId }, { isActive: false });
  
      // Activate the selected pop-up image
      popUpToActivate.isActive = true;
      await popUpToActivate.save();
  
      res.status(200).json({ message: 'Pop-up image activated', popUpToActivate });
    } catch (error) {
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  });

  // ✅ Delete a pop-up image
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const restaurantId = req.user.restaurantId; // Ensure only the owner can delete
  
      const popUp = await PopUpImage.findOne({ _id: id, restaurantId });
      if (!popUp) {
        return res.status(404).json({ error: 'Pop-up image not found' });
      }
  
      await PopUpImage.findByIdAndDelete(id);
      res.status(200).json({ message: 'Pop-up image deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  });
  
  export default router