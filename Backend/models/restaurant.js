import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  number: { type: String, required: true },
  address: { type: String, required: true },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Reference to the Category model
    },
  ],
  qrCodeUrl: { type: String }, // Add the field for QR code URL
  qrCodeImage: { type: String }, // Add the field for QR code image
  profileImage: { type: String }, // New field for profile image
  bannerImage: { type: String }, // New field for banner image
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;
