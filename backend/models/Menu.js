import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  spiciness: Number,
  isFeatured: Boolean,
  isAvailable: { type: Boolean, default: true }
});

const menuSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true
  },
  items: [itemSchema]
}, { timestamps: true });

export default mongoose.model("Menu", menuSchema);
