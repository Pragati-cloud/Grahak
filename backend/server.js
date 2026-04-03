import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import crypto from "crypto";

import { v4 as uuidv4 } from "uuid";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import menuRoutes from "./routes/menu.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/spice-haven";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Payment Schema
const paymentSchema = new mongoose.Schema({
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  token: { type: String, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const TempPayment = mongoose.model("TempPayment", paymentSchema);

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "YOUR_KEY_ID",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET",
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/orders-db", orderRoutes); // Renamed path to avoid conflict with existing payment flow
app.use("/api/payments", paymentRoutes);

app.post("/api/orders", async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.post("/api/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Generate Token using uuid with fallback
      let token;
      try {
        const prefix = 'SH-ON-';
        token = prefix + uuidv4().split('-')[0].toUpperCase() + '-' + uuidv4().split('-')[1].toUpperCase();
      } catch (e) {
        console.error("UUID generation failed, using fallback:", e);
        const prefix = 'SH-ON-';
        token = prefix + Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
      }

      // Save payment to MongoDB
      const newPayment = new TempPayment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount,
        currency,
        token,
        status: "success",
      });
      
      if (mongoose.connection.readyState === 1) {
        await newPayment.save();
      } else {
        console.warn("MongoDB not connected, skipping save but returning token.");
      }

      res.status(200).json({ status: 'success', message: 'Payment verified successfully', token });
    } else {
      res.status(400).json({ status: "failure", message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

app.post("/api/orders/cash", async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    // Generate Token using uuid with fallback
    let token;
    try {
      const prefix = 'SH-CS-';
      token = prefix + uuidv4().split('-')[0].toUpperCase() + '-' + uuidv4().split('-')[1].toUpperCase();
    } catch (e) {
      console.error("UUID generation failed, using fallback:", e);
      const prefix = 'SH-CS-';
      token = prefix + Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    }

    // Save order to MongoDB (using the same schema but status 'cash')
    const newPayment = new TempPayment({
      razorpay_order_id: "CASH_" + Date.now(),
      razorpay_payment_id: "CASH_" + Date.now(),
      razorpay_signature: "CASH_" + Date.now(),
      amount,
      currency: currency || "INR",
      token,
      status: "cash",
    });

    if (mongoose.connection.readyState === 1) {
      await newPayment.save();
    } else {
      console.warn("MongoDB not connected, skipping save but returning token.");
    }

    res.status(200).json({ status: 'success', token });
  } catch (error) {
    console.error("Error creating cash order:", error);
    res.status(500).json({ 
      error: "Failed to process cash order", 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.set("io", io);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend API Server running natively on http://localhost:${PORT}`);
});
