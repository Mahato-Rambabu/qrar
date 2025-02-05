import mongoose from 'mongoose';

const comboDealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String, // URL or file path to the deal image.
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  // Type of deal: product-product, category-category, or product-category.
  dealType: {
    type: String,
    enum: ['product-product', 'category-category', 'product-category'],
    required: true,
  },
  // For product-product deals.
  product1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  product2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  // For category-category deals.
  category1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  category2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  // For product-category deals.
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  // Details about the offer.
  comboOffer: {
    type: {
      type: String,
      enum: ['free', 'discount', 'fixed-price'],
      required: true,
    },
    value: {
      type: Number,
      // When type is "free", value is not required.
      required: function() {
        return this.comboOffer && this.comboOffer.type !== 'free';
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

const ComboDeal = mongoose.model('ComboDeal', comboDealSchema);
export default ComboDeal;
