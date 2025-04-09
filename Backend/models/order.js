import mongoose from "mongoose";

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
        taxRate: {
          type: Number,
          default: 0,
        },
      },
    ],
    taxType: {
      type: String,
      enum: ["none", "inclusive", "exclusive"],
      default: "none",
    },
    excTaxRate: {
      type: Number,
      default: 0,
    },
    itemsTotal: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    gst: {
      type: Number,
      default: 0,
    },
    finalTotal: {
      type: Number,
      required: true,
      min: [0, "Final total must be a positive number"],
    },
    serviceCharge: {
      type: Number,
      default: 0,
    },
    packingCharge: {
      type: Number,
      default: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    tableNumber: {
      type: Number,
      required: false,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Online", "Unpaid"],
      default: "Unpaid",
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid", "Refunded"],
      default: "Unpaid",
    },
    refundStatus: {
      type: String,
      enum: ["Not Applicable", "Processing", "Completed"],
      default: "Not Applicable",
    },
    modeOfOrder: {
      type: String,
      enum: ["Dine-in", "Takeaway", "Delivery"],
      default: "Dine-in",
    },
    orderNotes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Served"],
      default: "Pending",
    },
    orderNo: {
      type: Number,
      required: true,
      index:true,
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

export default mongoose.model("Order", orderSchema);