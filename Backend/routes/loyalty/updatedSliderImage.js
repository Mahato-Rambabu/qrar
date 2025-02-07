import express from 'express';
import LoyaltyProgram from '../../models/loyalty/loyaltyProgram.js';
import { upload } from '../../config/multerConfig.js';
import authMiddleware from '../../middlewares/authMiddlewares.js';

const router = express.Router();

// ✅ Add a new loyalty program entry (attach an offer)
router.post('/', authMiddleware, upload.single('img'), async (req, res) => {
  try {
    const { offer } = req.body; // Expect an offer (Offer ObjectId)
    const restaurantId = req.user.restaurantId;
    const imgPath = req.file ? req.file.path : null;

    if (!imgPath || !offer) {
      return res.status(400).json({ error: 'Image and offer are required' });
    }

    const newLoyaltyProgram = {
      img: imgPath,
      restaurantId,
      offer, // attach offer reference
    };

    const savedLoyalty = await LoyaltyProgram.create(newLoyaltyProgram);
    res.status(201).json(savedLoyalty);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// ✅ Fetch all loyalty program entries for a restaurant
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const loyaltyEntries = await LoyaltyProgram.find({ restaurantId });

    if (loyaltyEntries.length === 0) {
      return res.status(404).json({ error: 'No loyalty programs found for this restaurant' });
    }

    res.status(200).json(loyaltyEntries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// ✅ Delete a loyalty program entry
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    const loyaltyEntry = await LoyaltyProgram.findOne({ _id: id, restaurantId });
    if (!loyaltyEntry) {
      return res.status(404).json({ error: 'Loyalty program not found or unauthorized' });
    }

    await LoyaltyProgram.findByIdAndDelete(id);
    res.status(200).json({ message: 'Loyalty program deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// ✅ Update a loyalty program entry
router.put('/:id', authMiddleware, upload.single('img'), async (req, res) => {
  try {
    const { id } = req.params;
    const { offer } = req.body; // Optionally update the offer reference
    const restaurantId = req.user.restaurantId;
    const imgPath = req.file ? req.file.path : null;

    let updateData = {};
    if (imgPath) updateData.img = imgPath;
    if (offer) updateData.offer = offer;

    const updatedEntry = await LoyaltyProgram.findOneAndUpdate(
      { _id: id, restaurantId },
      updateData,
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ error: 'Loyalty program not found or unauthorized' });
    }

    res.status(200).json(updatedEntry);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;
