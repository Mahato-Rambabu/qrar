import express from 'express';
import CouponCode from '../../models/loyalty/coupon.js';
import authMiddleware from '../../middlewares/authMiddlewares.js';

const router = express.Router();

/**
 * Create a new coupon code.
 * The restaurantId is taken from req.user (set by authMiddleware).
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, code, type, limit, expiryDate, discountType, discountValue } = req.body;
    const restaurantId = req.user.restaurantId; // From token

    // Validate required fields
    if (!name || !code || !type || !discountType || discountValue == null) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
    if (type === 'limited-users' && !limit) {
      return res.status(400).json({ error: 'Limit is required for limited-users type' });
    }
    if (type === 'time-limited' && !expiryDate) {
      return res.status(400).json({ error: 'Expiry date is required for time-limited type' });
    }

    const newCoupon = new CouponCode({
      name,
      code,
      type,
      limit: type === 'limited-users' ? limit : null,
      expiryDate: type === 'time-limited' ? expiryDate : null,
      discountType,
      discountValue,
      restaurantId, // attach restaurantId
      isActive: true, // Default active state
    });

    const savedCoupon = await newCoupon.save();
    res.status(201).json(savedCoupon);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Get all coupons for the restaurant.
 * The restaurantId is taken from req.user.
 */
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const coupons = await CouponCode.find({ restaurantId });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Get a single coupon code by its ID, ensuring it belongs to the restaurant.
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const coupon = await CouponCode.findOne({ _id: id, restaurantId });
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Apply a coupon code.
 * This route checks coupon validity and applies the discount.
 * It filters by restaurantId.
 */
router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const { code, orderValue, productValue } = req.body;
    const restaurantId = req.user.restaurantId;

    const coupon = await CouponCode.findOne({ code, isActive: true, restaurantId });
    if (!coupon) {
      return res.status(400).json({ error: 'Invalid or inactive coupon' });
    }

    // Check for expiry in time-limited coupons
    if (coupon.type === 'time-limited' && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    // Check the usage limit for limited-users coupons
    if (coupon.type === 'limited-users' && coupon.redeemedUsers >= coupon.limit) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }

    // Calculate discount. (Modify the logic as needed.)
    let discountAmount = coupon.discountValue;
    // For example, if discountType is 'total-order', apply discount to the total order value.
    // If discountType is 'product', you might only apply it to productValue.
    const finalPrice =
      coupon.discountType === 'total-order'
        ? orderValue - discountAmount
        : orderValue - (productValue ? discountAmount : 0);

    // Increment the redeemedUsers count.
    coupon.redeemedUsers += 1;
    await coupon.save();

    res.status(200).json({
      message: 'Coupon applied successfully',
      discountAmount,
      finalPrice,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Toggle the active state of a coupon.
 * Only the restaurant owner can toggle their coupon, filtered by restaurantId.
 */
router.put('/toggle/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const coupon = await CouponCode.findOne({ _id: id, restaurantId });
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.status(200).json({
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`,
      coupon,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * Delete a coupon code.
 * Only allowed if it belongs to the restaurant.
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const coupon = await CouponCode.findOne({ _id: id, restaurantId });
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    await CouponCode.findByIdAndDelete(id);
    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;
