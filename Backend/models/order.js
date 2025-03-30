import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

// Initialize AutoIncrement
const AutoIncrement = AutoIncrementFactory(mongoose);

const orderSchema = new mongoose.Schema(
  {
    // 🔹 Restaurant Information
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    restaurantDetails: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    customerIdentifier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔹 Customer Information
    customer: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },

    // 🔹 Order Items
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

    // 🔹 Order Totals & Taxes
    subtotal: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    totalGST: { type: Number, required: true },
    applyOverallGST: { type: Boolean, default: false },
    overallGST: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    packingCharge: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    finalTotal: { type: Number, required: true },

    // 🔹 Order Status & Payment
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Served", "Cancelled"],
      default: "Pending",
    },
    orderNo: { type: Number, unique: true },
    tableNumber: { type: Number, required: false },
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
    orderNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

// 🔹 Auto-Increment Order Number
orderSchema.plugin(AutoIncrement, { inc_field: "orderNo" });

export default mongoose.model("Order", orderSchema);