import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    unique: true
  },
  
  phone: { type: String }, // Step 2

  shopDetails: {           // Step 3
    shopName: String,
    gstNumber: String,
    shopPhotoUrl: String,
    address: String,
    category: String, 
  },

  documents: {             // Step 3
    governmentIdUrl: String,
  },

  // Step 4
  verificationStatus: {
    type: String,
    enum: ["incomplete", "pending", "approved", "rejected"],
    default: "incomplete"
  },

  settings: {
    acceptOnlinePayment: { type: Boolean, default: true },
    acceptCash: { type: Boolean, default: true }
  }

}, { timestamps: true });

export default mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);
