import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  img: {
    type: String, // This can be a file path or URL to the image
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  // Array of days when the offer is active (e.g., ["Saturday", "Sunday"])
  applicableDays: [{
    type: String,
  }],
  // Time range in HH:MM (24-hour format) for when the offer is active
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  // Conditions for applying the discount: if the bill is more than minBillAmount then discountPercentage applies
  discountCondition: {
    minBillAmount: {
      type: Number,
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
    }
  },
  // Optionally link offer to specific products and/or categories
  linkedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  linkedCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  // Optional field to set the priority or order of the offer
  priority: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;
