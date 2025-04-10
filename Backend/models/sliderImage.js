import mongoose from 'mongoose';

const sliderImageSchema = new mongoose.Schema({
  img: {
    type: String, // Path or URL to the image
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant', // Reference to the Restaurant model
    required: true,
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer', // Reference to the Offer model
    required: false, // Make offer optional
  }
}, { timestamps: true });

const SliderImage = mongoose.model('SliderImage', sliderImageSchema);

export default SliderImage;
