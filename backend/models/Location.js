import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },

  address: String,

  vendors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor"
    }
  ]
}, { timestamps: true });

export default mongoose.model("Location", locationSchema);
