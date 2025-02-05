import mongoose from 'mongoose';

const couponCodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure coupon names are unique
  },
  code: {
    type: String,
    required: true,
    unique: true, // Unique coupon code
  },
  type: {
    type: String,
    enum: ['limited-users', 'time-limited'], // Coupon types
    required: true,
  },
  limit: {
    type: Number,
    default: null, // Only used for 'limited-users' type
  },
  expiryDate: {
    type: Date,
    default: null, // Only used for 'time-limited' type
  },
  discountType: {
    type: String,
    enum: ['product', 'total-order'], // Apply to product or total order
    required: true,
  },
  discountValue: {
    type: Number,
    required: true, // Fixed discount amount or percentage
  },
  redeemedUsers: {
    type: Number,
    default: 0, // Track how many people have used it
  },
  isActive: {
    type: Boolean,
    default: true, // Active state for the coupon
  },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant', // Reference to the Restaurant model
      required: true,
    },
}, { timestamps: true });

const CouponCode = mongoose.model('CouponCode', couponCodeSchema);

export default CouponCode;
