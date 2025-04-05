import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  number: { type: String, required: true },
  address: { type: String, required: true },
  taxType: { type: String, enum: ['inclusive', 'exclusive', 'none'], default: 'none' },
  taxPercentage: { type: Number, default: 0 },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  qrCodeUrl: { type: String },
  qrCodeImage: { type: String },
  profileImage: { type: String },
  bannerImage: { type: String },
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;