import express from 'express';
import Offer from '../../models/loyalty/offer.js';
import authMiddleware from '../../middlewares/authMiddlewares.js';
import { upload } from '../../config/multerConfig.js'; // if using file uploads for image

const router = express.Router();

/**
 * Create a new offer.
 * Uses authMiddleware to set restaurantId.
 * Uses multer to handle the image upload.
 */
router.post('/', authMiddleware, upload.single('img'), async (req, res) => {
  try {
    const {
      title,
      description,
      applicableDays,
      startTime,
      endTime,
      discountCondition, // expect an object: { minBillAmount, discountPercentage }
      linkedProducts,
      linkedCategories,
      priority,
    } = req.body;
    const restaurantId = req.user.restaurantId;
    const imgPath = req.file ? req.file.path : req.body.img; // allow image URL fallback

    // Basic validations:
    if (!title || !imgPath || !startTime || !endTime || !discountCondition) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    // Optionally parse discountCondition if sent as JSON string from Postman
    let discountObj = discountCondition;
    if (typeof discountCondition === 'string') {
      discountObj = JSON.parse(discountCondition);
    }
    if (!discountObj.minBillAmount || !discountObj.discountPercentage) {
      return res.status(400).json({ error: 'Discount condition details are missing' });
    }

    // Create new offer object
    const newOffer = new Offer({
      title,
      description,
      img: imgPath,
      restaurantId,
      applicableDays: applicableDays ? (Array.isArray(applicableDays) ? applicableDays : [applicableDays]) : [],
      startTime,
      endTime,
      discountCondition: discountObj,
      linkedProducts: linkedProducts ? (Array.isArray(linkedProducts) ? linkedProducts : [linkedProducts]) : [],
      linkedCategories: linkedCategories ? (Array.isArray(linkedCategories) ? linkedCategories : [linkedCategories]) : [],
      priority: priority || 0,
      isActive: true,
    });

    const savedOffer = await newOffer.save();
    res.status(201).json(savedOffer);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Get all offers for the authenticated restaurant.
 */
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const offers = await Offer.find({ restaurantId });
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Get a single offer by its ID (only if it belongs to the restaurant).
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const offer = await Offer.findOne({ _id: id, restaurantId });
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Update an offer.
 * You can update any field including image.
 */
router.put('/:id', authMiddleware, upload.single('img'), async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const {
      title,
      description,
      applicableDays,
      startTime,
      endTime,
      discountCondition,
      linkedProducts,
      linkedCategories,
      priority,
      isActive,
    } = req.body;
    
    let updateData = {
      title,
      description,
      startTime,
      endTime,
      priority: priority || 0,
    };

    if (applicableDays) {
      updateData.applicableDays = Array.isArray(applicableDays) ? applicableDays : [applicableDays];
    }
    
    // Handle discountCondition parsing if needed
    if (discountCondition) {
      updateData.discountCondition = typeof discountCondition === 'string'
        ? JSON.parse(discountCondition)
        : discountCondition;
    }
    
    if (linkedProducts) {
      updateData.linkedProducts = Array.isArray(linkedProducts) ? linkedProducts : [linkedProducts];
    }
    
    if (linkedCategories) {
      updateData.linkedCategories = Array.isArray(linkedCategories) ? linkedCategories : [linkedCategories];
    }
    
    // Toggle active state if provided explicitly
    if (typeof isActive !== 'undefined') {
      updateData.isActive = isActive;
    }
    
    // If image file is provided, update the image path
    if (req.file) {
      updateData.img = req.file.path;
    } else if (req.body.img) {
      updateData.img = req.body.img;
    }

    const updatedOffer = await Offer.findOneAndUpdate(
      { _id: id, restaurantId },
      updateData,
      { new: true }
    );

    if (!updatedOffer) {
      return res.status(404).json({ error: 'Offer not found or unauthorized' });
    }

    res.status(200).json(updatedOffer);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Toggle the active state of an offer.
 */
router.put('/toggle/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const offer = await Offer.findOne({ _id: id, restaurantId });
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    offer.isActive = !offer.isActive;
    await offer.save();
    res.status(200).json({ message: `Offer ${offer.isActive ? 'activated' : 'deactivated'}`, offer });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Delete an offer.
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const offer = await Offer.findOne({ _id: id, restaurantId });
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    await Offer.findByIdAndDelete(id);
    res.status(200).json({ message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;
