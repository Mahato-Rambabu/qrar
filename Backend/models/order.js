import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

// Pass mongoose instance to the plugin
const AutoIncrement = AutoIncrementFactory(mongoose);

const orderSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      min: [0, "Total must be a positive number"],
    },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Served"],
      default: "Pending",
    },
    orderNo: {
      type: Number,
      unique: true,
    },
    customerIdentifier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure at least one item is present in the order
orderSchema.pre("validate", function (next) {
  if (!this.items || this.items.length === 0) {
    return next(new Error("Order must contain at least one item."));
  }
  next();
});

// Use AutoIncrement for orderNo
orderSchema.plugin(AutoIncrement, { inc_field: "orderNo" });

export default mongoose.model("Order", orderSchema);
