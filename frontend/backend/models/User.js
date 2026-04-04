import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed with bcrypt
  role: {
    type: String,
    enum: ["customer", "vendor", "admin"],
    default: "customer"
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
