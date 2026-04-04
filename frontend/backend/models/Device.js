import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true
  },

  deviceType: {
    type: String,
    enum: ["mobile", "tablet", "scanner"],
    default: "mobile"
  },

  deviceName: String,

  lastActive: Date,

  isActive: { type: Boolean, default: true }

}, { timestamps: true });

export default mongoose.model("Device", deviceSchema);
