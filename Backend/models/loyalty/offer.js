// models/loyalty/offer.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const OfferSchema = new Schema({
  restaurantId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Restaurant',
  },
  title: {
    type: String,
    required: true,
  },
  targetType: {
    type: String,
    enum: ['product', 'category', 'all'],
    required: true,
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: function () {
      return this.targetType !== 'all';
    },
  },
  discountPercentage: {
    type: Number,
    required: true,
  },
  activationTime: {
    type: Date,
    required: true,
  },
  expirationTime: {
    type: Date,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model('Offer', OfferSchema);
