import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },

  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true
  },

  amount: { type: Number, required: true },

  method: {
    type: String,
    enum: ["UPI", "CASH", "CARD"],
    required: true
  },

  status: {
    type: String,
    enum: ["SUCCESS", "FAILED", "PENDING"],
    default: "PENDING"
  },

  transactionRef: String

}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
