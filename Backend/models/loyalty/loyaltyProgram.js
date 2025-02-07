import mongoose from 'mongoose';

const loyaltyProgramSchema = new mongoose.Schema({
  img: {
    type: String, // Path or URL to the image
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  // Instead of attaching product/category info, we attach an offer.
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: true,
  }
}, { timestamps: true });

const LoyaltyProgram = mongoose.model('LoyaltyProgram', loyaltyProgramSchema);

export default LoyaltyProgram;
