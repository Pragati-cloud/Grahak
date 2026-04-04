import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },

  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  items: [
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ],

  totalAmount: { type: Number, required: true },

  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED"],
    default: "PENDING"
  },

  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
  },

  orderStatus: {
    type: String,
    enum: ["PLACED", "PREPARING", "READY", "COMPLETED"],
    default: "PLACED"
  },

  tokenNumber: Number,
  estimatedTime: Number,

  qrCode: String,

  isDelivered: { type: Boolean, default: false },
  isCancelled: { type: Boolean, default: false }

}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
