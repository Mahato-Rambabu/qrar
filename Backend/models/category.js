import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  catName: {
    type: String,
    required: true,
  },
  img: {
    type: String, // Path to the uploaded image
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Reference to the Product model
    },
  ],
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant', // Reference to the parent Restaurant
    required: true,
  },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;
