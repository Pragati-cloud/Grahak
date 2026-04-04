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



// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/orders-db", orderRoutes); // Renamed path to avoid conflict with existing payment flow
app.use("/api/payments", paymentRoutes);




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
