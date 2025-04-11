import mongoose from "mongoose";

const RestaurantUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    // Restaurant-specific user data
    lastVisit: {
      type: Date,
      default: null,
    },
    visitCount: {
      type: Number,
      default: 0,
    },
    preferences: {
      type: Map,
      of: String,
      default: {},
    },
    // Add any other restaurant-specific user data here
    // For example: favorite items, dietary restrictions, etc.
  },
  {
    timestamps: true,
  }
);

// Create a compound index for faster lookups
RestaurantUserSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });

const RestaurantUser = mongoose.model("RestaurantUser", RestaurantUserSchema);
export default RestaurantUser; 