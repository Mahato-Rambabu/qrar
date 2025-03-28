import express from 'express';
import mongoose from 'mongoose';
import Offer from '../../models/loyalty/offer.js'; // Updated Offer model
import authMiddleware from '../../middlewares/authMiddlewares.js';

const router = express.Router();

/**
 * Create a new offer.
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      targetType,
      targetId,
      discountPercentage,
      activationTime,
      expirationTime,
      status,
    } = req.body;
    const restaurantId = req.user.restaurantId;

    if (!title || !targetType || !discountPercentage || !activationTime) {
      return res.status(400).json({
        error:
          'Missing required fields: title, targetType, discountPercentage, and activationTime are required.',
      });
    }
    if (targetType !== 'all' && !targetId) {
      return res
        .status(400)
        .json({ error: 'targetId is required for product or category offers' });
    }

    const newOffer = new Offer({
      title,
      restaurantId,
      targetType,
      targetId: targetType !== 'all' ? targetId : undefined,
      discountPercentage,
      activationTime,
      expirationTime,
      status: typeof status !== 'undefined' ? status : true,
    });

    const savedOffer = await newOffer.save();
    res.status(201).json(savedOffer);
  } catch (error) {
    console.error(error);
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
 * Fetch all active offers for the authenticated restaurant.
 * Active offers have:
 *   - status === true,
 *   - activationTime <= now,
 *   - and either no expirationTime or expirationTime > now.
 */

router.get("/active", authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.id; // Corrected from req.user.restaurantId
    const now = new Date();
    
    const activeOffers = await Offer.find({
      restaurantId,
      status: true,
      activationTime: { $lte: now },
      $or: [
        { expirationTime: { $exists: false } },
        { expirationTime: null },
        { expirationTime: { $gt: now } },
      ],
    }).populate('restaurantId', 'name'); // Add population

    res.status(200).json(activeOffers);
  } catch (error) {
    console.error("Error fetching active offers:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});
/**
 * Fetch offers by restaurantId (this route is used when the restaurant id is passed in the URL).
 * Note: Place this route AFTER /active to avoid conflict.
 */
router.get('/:restaurantId', async (req, res) => {
  const { restaurantId } = req.params;
  const { targetType, targetId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    return res.status(400).json({ error: 'Invalid restaurantId' });
  }

  try {
    const now = new Date();
    let query = {
      restaurantId,
      status: true,
      activationTime: { $lte: now },
      $or: [
        { expirationTime: { $exists: false } },
        { expirationTime: null },
        { expirationTime: { $gt: now } },
      ],
    };

    if (targetType) {
      query.targetType = targetType;
      if (targetId && targetType !== 'all') {
        query.targetId = targetId;
      }
    }

    const activeOffers = await Offer.find(query);
    if (!activeOffers || activeOffers.length === 0) {
      return res.status(404).json({ error: 'No active offers found' });
    }

    const offersByType = {
      all: [],
      categories: {},
      products: {},
    };

    activeOffers.forEach((offer) => {
      if (offer.targetType === 'all') {
        offersByType.all.push(offer);
      } else if (offer.targetType === 'category') {
        if (!offersByType.categories[offer.targetId]) {
          offersByType.categories[offer.targetId] = [];
        }
        offersByType.categories[offer.targetId].push(offer);
      } else if (offer.targetType === 'product') {
        if (!offersByType.products[offer.targetId]) {
          offersByType.products[offer.targetId] = [];
        }
        offersByType.products[offer.targetId].push(offer);
      }
    });

    res.status(200).json(offersByType);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Get a single offer by its ID.
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
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const {
      title,
      targetType,
      targetId,
      discountPercentage,
      activationTime,
      expirationTime,
      status,
    } = req.body;

    let updateData = {};
    if (title) updateData.title = title;
    if (targetType) updateData.targetType = targetType;
    if (discountPercentage) updateData.discountPercentage = discountPercentage;
    if (activationTime) updateData.activationTime = activationTime;
    if (expirationTime) updateData.expirationTime = expirationTime;
    if (typeof status !== 'undefined') updateData.status = status;

    if ((targetType && targetType !== 'all') || req.body.targetId) {
      updateData.targetId = targetId;
    } else if (targetType === 'all') {
      updateData.targetId = undefined;
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
    offer.status = !offer.status;
    await offer.save();
    res.status(200).json({
      message: `Offer ${offer.status ? 'activated' : 'deactivated'}`,
      offer,
    });
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
