import mongoose from 'mongoose';

const loyaltyProgramSchema = new mongoose.Schema({
  img: {
    type: String, // Path or URL to the image
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
  },
  type: {
    type: String,
    enum: ['seasonal', 'category', 'product'],
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: function () {
      return this.type === 'category';
    },
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      discountPercentage: Number,
    },
  ],
}, { timestamps: true });

const LoyaltyProgram = mongoose.model('LoyaltyProgram', loyaltyProgramSchema);

export default LoyaltyProgram;
