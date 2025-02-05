import mongoose from 'mongoose';

const popUpSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  img: {
    type: String, // Path or URL to the image
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant', // Reference to the Restaurant model
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false, // Only one can be active at a time
  }
}, { timestamps: true });

const PopUpImage = mongoose.model('PopUpImage', popUpSchema);

export default PopUpImage;
