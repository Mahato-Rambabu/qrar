import express from 'express';
import ComboDeal from '../../models/loyalty/comboDeals.js';
import authMiddleware from '../../middlewares/authMiddlewares.js';
import { upload } from '../../config/multerConfig.js'; // if using file uploads

const router = express.Router();

/**
 * Create a new combo deal.
 * Expects the proper fields based on the dealType.
 * If an image file is provided, it uses that; otherwise, it may use an image URL.
 */
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      dealType,
      product1,
      product2,
      category1,
      category2,
      product,
      category,
      comboOffer, // expected to be a JSON string or object: { type: "discount", value: 10 }
    } = req.body;
    
    const restaurantId = req.user.restaurantId;
    // Use the uploaded file's path if available; otherwise, check for an image URL in the body.
    const imagePath = req.file ? req.file.path : req.body.image || '';

    if (!title || !dealType || !comboOffer) {
      return res.status(400).json({ error: 'Title, dealType and comboOffer are required.' });
    }

    // If comboOffer is a string, parse it.
    let offerData = comboOffer;
    if (typeof comboOffer === 'string') {
      offerData = JSON.parse(comboOffer);
    }
    if (!offerData.type) {
      return res.status(400).json({ error: 'comboOffer must have a type.' });
    }

    // Build the new combo deal object.
    let newDeal = {
      title,
      image: imagePath,
      restaurantId,
      dealType,
      comboOffer: offerData,
      isActive: true,
    };

    // Based on dealType, attach the proper fields.
    switch(dealType) {
      case 'product-product':
        if (!product1 || !product2) {
          return res.status(400).json({ error: 'For product-product deals, both product1 and product2 are required.' });
        }
        newDeal.product1 = product1;
        newDeal.product2 = product2;
        break;
      case 'category-category':
        if (!category1 || !category2) {
          return res.status(400).json({ error: 'For category-category deals, both category1 and category2 are required.' });
        }
        newDeal.category1 = category1;
        newDeal.category2 = category2;
        break;
      case 'product-category':
        if (!product || !category) {
          return res.status(400).json({ error: 'For product-category deals, product and category are required.' });
        }
        newDeal.product = product;
        newDeal.category = category;
        break;
      default:
        return res.status(400).json({ error: 'Invalid dealType.' });
    }

    const savedDeal = await ComboDeal.create(newDeal);
    res.status(201).json(savedDeal);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Get all combo deals for the restaurant.
 */
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const deals = await ComboDeal.find({ restaurantId });
    res.status(200).json(deals);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Get a single combo deal by its ID (only if it belongs to the restaurant).
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const deal = await ComboDeal.findOne({ _id: id, restaurantId });
    if (!deal) {
      return res.status(404).json({ error: 'Combo deal not found' });
    }
    res.status(200).json(deal);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Update a combo deal.
 * You may update any field. If updating the image, file upload is handled via multer.
 */
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const {
      title,
      dealType,
      product1,
      product2,
      category1,
      category2,
      product,
      category,
      comboOffer,
      isActive,
    } = req.body;
    
    let updateData = {};
    if (title) updateData.title = title;
    if (dealType) updateData.dealType = dealType;
    if (typeof isActive !== 'undefined') updateData.isActive = isActive;
    
    // If an image file is provided, update image; otherwise check if an image URL is provided.
    if (req.file) {
      updateData.image = req.file.path;
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }
    
    if (comboOffer) {
      updateData.comboOffer = typeof comboOffer === 'string' ? JSON.parse(comboOffer) : comboOffer;
    }
    
    // Based on the dealType (or if unchanged, the existing deal's type) update related fields.
    // If the client sends dealType in update, use that; otherwise, the current type remains.
    if (dealType === 'product-product' || (dealType == null && (product1 || product2))) {
      if (product1) updateData.product1 = product1;
      if (product2) updateData.product2 = product2;
    }
    if (dealType === 'category-category' || (dealType == null && (category1 || category2))) {
      if (category1) updateData.category1 = category1;
      if (category2) updateData.category2 = category2;
    }
    if (dealType === 'product-category' || (dealType == null && (product || category))) {
      if (product) updateData.product = product;
      if (category) updateData.category = category;
    }

    const updatedDeal = await ComboDeal.findOneAndUpdate(
      { _id: id, restaurantId },
      updateData,
      { new: true }
    );

    if (!updatedDeal) {
      return res.status(404).json({ error: 'Combo deal not found or unauthorized' });
    }

    res.status(200).json(updatedDeal);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Toggle the active state of a combo deal.
 */
router.put('/toggle/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const deal = await ComboDeal.findOne({ _id: id, restaurantId });
    if (!deal) {
      return res.status(404).json({ error: 'Combo deal not found' });
    }
    deal.isActive = !deal.isActive;
    await deal.save();
    res.status(200).json({ message: `Combo deal ${deal.isActive ? 'activated' : 'deactivated'}`, deal });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Delete a combo deal.
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const deal = await ComboDeal.findOne({ _id: id, restaurantId });
    if (!deal) {
      return res.status(404).json({ error: 'Combo deal not found' });
    }
    await ComboDeal.findByIdAndDelete(id);
    res.status(200).json({ message: 'Combo deal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;
