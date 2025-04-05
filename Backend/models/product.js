import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  img: {
    type: String, // Path to the product image
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  taxRate: {
    type: Number,
    default: 0, // Only applicable for inclusive tax restaurants
  },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
