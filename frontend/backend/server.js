import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Razorpay from "razorpay";
import { MongoClient, ObjectId } from "mongodb";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import menuRoutes from "./routes/menu.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";
import mongoose from "mongoose";
import ttsRoutes from "./routes/tts.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// ─────────────────────────────────────────────
// MongoDB Native Driver Connection
// ─────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "spice-haven";
console.log(`🔗 Connecting to MongoDB at ${MONGODB_URI}, database: ${DB_NAME}...`);
const client = new MongoClient(MONGODB_URI);
let db;

async function connectDB() {
  await client.connect();
  await mongoose.connect(MONGODB_URI);
  db = client.db(DB_NAME);
  console.log(`✅ Connected to MongoDB — database: ${DB_NAME}`);
}
connectDB().catch((err) => console.error("MongoDB connection error:", err));


// Helper: get a collection by name
const col = (name) => db.collection(name);

// Helper: safely parse an ObjectId — returns null if invalid
function toObjectId(id) {
  try { return new ObjectId(id); } catch { return null; }
}


// ─────────────────────────────────────────────
// QR VALIDATION UTILITY (TOTP-style)
// Rotates every 30 seconds. Validates current + previous window (±30s clock skew).
// Planned upgrade: HMAC-SHA256(secret, timeWindow.toString())
// ─────────────────────────────────────────────
function validateQRToken(scannedToken, secret) {
  const parts = scannedToken.split(".");
  if (parts.length !== 3) return { valid: false, reason: "Malformed token" };

  const [tokenDeviceId, tokenTimestamp, signature] = parts;

  const tokenTime = parseInt(tokenTimestamp, 10);
  if (isNaN(tokenTime))
    return { valid: false, reason: "Invalid timestamp" };

  const age = Math.floor(Date.now() / 1000) - tokenTime;
  if (age < 0) return { valid: false, reason: "Token from the future" };
  if (age > 90) return { valid: false, reason: `Token expired (${age}s old)` };

  const fullSig = crypto
    .createHash("sha1")
    .update(secret + tokenDeviceId + tokenTimestamp + secret)
    .digest("hex");

  const expectedSig = fullSig.substring(0, 16);  // match ESP truncation

  if (expectedSig !== signature)
    return { valid: false, reason: "Signature mismatch" };

  return { valid: true, deviceId: tokenDeviceId };
}

function generateQRToken(secret) {
  const timeWindow = Math.floor(Date.now() / 1000 / 30);
  return `${secret}-${timeWindow}`;
}


// ─────────────────────────────────────────────
// Razorpay Instance
// ─────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "YOUR_KEY_ID",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET",
});


// ─────────────────────────────────────────────
// Existing Route Files (unchanged)
// ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/orders-db", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/api/tts", ttsRoutes);


// ═════════════════════════════════════════════
// EXISTING: Razorpay Order Creation
// POST /api/orders
// ═════════════════════════════════════════════
app.post("/api/orders", async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    });
    res.status(200).json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});


// ═════════════════════════════════════════════
// EXISTING: Razorpay Payment Verification
// POST /api/verify
// ═════════════════════════════════════════════
app.post("/api/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ status: "failure", message: "Invalid signature" });
    }

    let token;
    try {
      token = "SH-ON-" + uuidv4().split("-")[0].toUpperCase() + "-" + uuidv4().split("-")[1].toUpperCase();
    } catch {
      token = "SH-ON-" + Math.random().toString(36).substr(2, 4).toUpperCase() + "-" + Math.random().toString(36).substr(2, 4).toUpperCase();
    }

    await col("temp_payments").insertOne({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      currency,
      token,
      status: "success",
      createdAt: new Date(),
    });

    res.status(200).json({ status: "success", message: "Payment verified successfully", token });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});


// ═════════════════════════════════════════════
// EXISTING: Cash Order
// POST /api/orders/cash
// ═════════════════════════════════════════════
app.post("/api/orders/cash", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    let token;
    try {
      token = "SH-CS-" + uuidv4().split("-")[0].toUpperCase() + "-" + uuidv4().split("-")[1].toUpperCase();
    } catch {
      token = "SH-CS-" + Math.random().toString(36).substr(2, 4).toUpperCase() + "-" + Math.random().toString(36).substr(2, 4).toUpperCase();
    }

    await col("temp_payments").insertOne({
      razorpay_order_id: "CASH_" + Date.now(),
      razorpay_payment_id: "CASH_" + Date.now(),
      razorpay_signature: "CASH_" + Date.now(),
      amount,
      currency: currency || "INR",
      token,
      status: "cash",
      createdAt: new Date(),
    });

    res.status(200).json({ status: "success", token });
  } catch (error) {
    console.error("Error creating cash order:", error);
    res.status(500).json({
      error: "Failed to process cash order",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});


// ═════════════════════════════════════════════
// SHOPS
// ═════════════════════════════════════════════

// POST /api/shops — Vendor registers their shop
app.post("/api/shops", async (req, res) => {
  try {
    const { name, owner_id } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Shop name is required" });
    if (!owner_id) return res.status(400).json({ error: "owner_id is required" });

    const result = await col("shops").insertOne({
      name: name.trim(),
      owner_id,
      createdAt: new Date(),
    });

    const shop = await col("shops").findOne({ _id: result.insertedId });
    res.status(201).json({ status: "success", shop });
  } catch (error) {
    console.error("Error creating shop:", error);
    res.status(500).json({ error: "Failed to create shop" });
  }
});

// GET /api/shops/:shop_id — Get shop details
app.get("/api/shops/:shop_id", async (req, res) => {
  try {
    const _id = toObjectId(req.params.shop_id);
    if (!_id) return res.status(400).json({ error: "Invalid shop_id" });

    const shop = await col("shops").findOne({ _id });
    if (!shop) return res.status(404).json({ error: "Shop not found" });

    res.status(200).json({ shop });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shop" });
  }
});


// ═════════════════════════════════════════════
// PRODUCTS (MENU ITEMS)
// ═════════════════════════════════════════════

// POST /api/shops/:shop_id/products — Vendor adds a menu item
// price must be in paise (₹1 = 100 paise)
app.post("/api/shops/:shop_id/products", async (req, res) => {
  try {
    const shop_id = toObjectId(req.params.shop_id);
    if (!shop_id) return res.status(400).json({ error: "Invalid shop_id" });

    const { name, price, owner_id } = req.body;

    const shop = await col("shops").findOne({ _id: shop_id });
    if (!shop) return res.status(404).json({ error: "Shop not found" });
    if (shop.owner_id !== owner_id) return res.status(403).json({ error: "Not authorised" });
    if (!name?.trim()) return res.status(400).json({ error: "Product name is required" });
    if (!price || price <= 0) return res.status(400).json({ error: "Price must be > 0 (in paise)" });

    const result = await col("products").insertOne({
      shop_id,
      name: name.trim(),
      price,
      available: true,
      createdAt: new Date(),
    });

    const product = await col("products").findOne({ _id: result.insertedId });
    res.status(201).json({ status: "success", product });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// GET /api/shops/:shop_id/products — Public menu for a shop
app.get("/api/shops/:shop_id/products", async (req, res) => {
  try {
    const shop_id = toObjectId(req.params.shop_id);
    if (!shop_id) return res.status(400).json({ error: "Invalid shop_id" });

    const products = await col("products").find({ shop_id, available: true }).toArray();
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// PATCH /api/products/:product_id — Update name, price, or availability
app.patch("/api/products/:product_id", async (req, res) => {
  try {
    const _id = toObjectId(req.params.product_id);
    if (!_id) return res.status(400).json({ error: "Invalid product_id" });

    const { name, price, available, owner_id } = req.body;

    const product = await col("products").findOne({ _id });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const shop = await col("shops").findOne({ _id: product.shop_id });
    if (!shop || shop.owner_id !== owner_id) return res.status(403).json({ error: "Not authorised" });

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = price;
    if (available !== undefined) updates.available = available;

    await col("products").updateOne({ _id }, { $set: updates });
    const updated = await col("products").findOne({ _id });
    res.status(200).json({ status: "success", product: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});


// ═════════════════════════════════════════════
// DEVICES (QR SCANNERS)
// ═════════════════════════════════════════════

// POST /api/shops/:shop_id/devices — Vendor registers a QR scanner device
// secret is stored server-side only — NEVER returned to clients after creation
app.post("/api/shops/:shop_id/devices", async (req, res) => {
  try {
    const shop_id = toObjectId(req.params.shop_id);
    if (!shop_id) return res.status(400).json({ error: "Invalid shop_id" });

    const { label, secret, owner_id } = req.body;

    const shop = await col("shops").findOne({ _id: shop_id });
    if (!shop) return res.status(404).json({ error: "Shop not found" });
    if (shop.owner_id !== owner_id) return res.status(403).json({ error: "Not authorised" });
    if (!secret || secret.length < 8) return res.status(400).json({ error: "Secret must be at least 8 characters" });

    const result = await col("devices").insertOne({
      shop_id,
      label: label || "Table",
      secret,   // stored server-side only — excluded from GET responses
      createdAt: new Date(),
    });

    // Return device WITHOUT secret
    res.status(201).json({
      status: "success",
      device: { _id: result.insertedId, shop_id, label: label || "Table", createdAt: new Date() },
    });
  } catch (error) {
    console.error("Error registering device:", error);
    res.status(500).json({ error: "Failed to register device" });
  }
});

// GET /api/shops/:shop_id/devices — List devices (secret field excluded)
app.get("/api/shops/:shop_id/devices", async (req, res) => {
  try {
    const shop_id = toObjectId(req.params.shop_id);
    if (!shop_id) return res.status(400).json({ error: "Invalid shop_id" });

    const devices = await col("devices")
      .find({ shop_id }, { projection: { secret: 0 } })  // exclude secret
      .toArray();

    res.status(200).json({ devices });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch devices" });
  }
});

// GET /api/devices/:device_id/qr-token — Dev only: generate current QR token
// In production, the physical QR device generates its own token using the shared secret
app.get("/api/devices/:device_id/qr-token", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Not available in production" });
  }
  try {
    const _id = toObjectId(req.params.device_id);
    if (!_id) return res.status(400).json({ error: "Invalid device_id" });

    const device = await col("devices").findOne({ _id });
    if (!device) return res.status(404).json({ error: "Device not found" });

    const token = generateQRToken(device.secret);
    const expires_in_seconds = 30 - (Math.floor(Date.now() / 1000) % 30);
    res.status(200).json({ token, expires_in_seconds });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate token" });
  }
});


// ═════════════════════════════════════════════
// CORE: PLACE ORDER
// POST /api/place-order
// Customer calls this after QR scan + payment
// ═════════════════════════════════════════════
app.post("/api/place-order", async (req, res) => {
  try {
    const {
      device_id,
      user_id,
      encrypted_qr,    // TOTP-style token scanned from QR
      product_ids,     // array of product _id strings
      quantities,      // parallel array of quantities
      payment_token,   // token from /api/verify or /api/orders/cash
      payment_method,  // "online" | "cash"
    } = req.body;

    if (!device_id || !user_id || !encrypted_qr || !product_ids || !quantities) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (product_ids.length !== quantities.length) {
      return res.status(400).json({ error: "product_ids and quantities must be the same length" });
    }
    if (!payment_token) {
      return res.status(402).json({ error: "Payment token is required" });
    }

    // Step 1: Look up device (need secret for QR validation)
    const deviceOid = toObjectId(device_id);
    if (!deviceOid) return res.status(400).json({ error: "Invalid device_id" });

    const device = await col("devices").findOne({ _id: deviceOid });
    if (!device) return res.status(404).json({ error: "Device not found" });

    // Step 2: Validate QR token — current and previous 30s window
    if (!validateQRToken("SECRET_KEY", encrypted_qr)) {
      return res.status(401).json({ error: "Invalid or expired QR token" });
    }

    // Step 3: Validate product IDs and confirm they belong to this shop
    const productOids = product_ids.map(toObjectId).filter(Boolean);
    if (productOids.length !== product_ids.length) {
      return res.status(400).json({ error: "One or more product IDs are invalid" });
    }

    const products = await col("products")
      .find({ _id: { $in: productOids }, shop_id: device.shop_id })
      .toArray();

    if (products.length !== product_ids.length) {
      return res.status(400).json({ error: "One or more products do not belong to this shop" });
    }

    // Step 4: Calculate total amount (in paise)
    const productMap = {};
    products.forEach(p => { productMap[p._id.toString()] = p; });

    let total_amount = 0;
    for (let i = 0; i < product_ids.length; i++) {
      total_amount += productMap[product_ids[i]].price * quantities[i];
    }

    // Step 5: Insert Order document
    const orderResult = await col("orders").insertOne({
      shop_id: device.shop_id,
      device_id: device._id,
      user_id,
      status: "PLACED",
      payment_method: payment_method || "online",
      payment_token,
      total_amount,
      created_at: new Date(),
    });
    const order_id = orderResult.insertedId;

    // Step 6: Insert order_items (one per product)
    const itemDocs = product_ids.map((pid, i) => ({
      order_id,
      product_id: toObjectId(pid),
      quantity: quantities[i],
    }));
    await col("order_items").insertMany(itemDocs);

    // Step 7: Fetch full order + enriched items for socket emit
    const order = await col("orders").findOne({ _id: order_id });
    const items = await col("order_items")
      .aggregate([
        { $match: { order_id } },
        { $lookup: { from: "products", localField: "product_id", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        { $project: { quantity: 1, "product.name": 1, "product.price": 1 } },
      ])
      .toArray();

    // Step 8: Emit live event to vendor dashboard
    const io = req.app.get("io");
    io.to(`shop_${device.shop_id}`).emit("new_order", { order, items });

    res.status(201).json({ status: "success", message: "Order placed successfully", order_id, total_amount });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Failed to place order", message: error.message });
  }
});


// ═════════════════════════════════════════════
// ORDER STATUS MANAGEMENT
// ═════════════════════════════════════════════

// PATCH /api/orders/:order_id/status — Vendor updates order status
// Transitions: PLACED → PREPARING | REJECTED
//              PREPARING → COMPLETED | REJECTED
//              COMPLETED and REJECTED are terminal states
app.patch("/api/orders/:order_id/status", async (req, res) => {
  try {
    const _id = toObjectId(req.params.order_id);
    if (!_id) return res.status(400).json({ error: "Invalid order_id" });

    const { new_status, owner_id } = req.body;
    const VALID_STATUSES = ["PLACED", "PREPARING", "COMPLETED", "REJECTED"];
    if (!VALID_STATUSES.includes(new_status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
    }

    const order = await col("orders").findOne({ _id });
    if (!order) return res.status(404).json({ error: "Order not found" });

    const shop = await col("shops").findOne({ _id: order.shop_id });
    if (!shop || shop.owner_id !== owner_id) {
      return res.status(403).json({ error: "Not authorised" });
    }

    if (["COMPLETED", "REJECTED"].includes(order.status)) {
      return res.status(409).json({ error: `Order is already ${order.status} and cannot be updated` });
    }

    const validTransitions = {
      PLACED: ["PREPARING", "REJECTED"],
      PREPARING: ["COMPLETED", "REJECTED"],
    };
    if (!validTransitions[order.status]?.includes(new_status)) {
      return res.status(409).json({ error: `Cannot transition from ${order.status} to ${new_status}` });
    }

    await col("orders").updateOne({ _id }, { $set: { status: new_status } });
    const updated = await col("orders").findOne({ _id });

    // Emit to vendor room and customer room
    const io = req.app.get("io");
    io.to(`shop_${order.shop_id}`).emit("order_status_updated", { order_id: _id, new_status });
    io.to(`customer_${order.user_id}`).emit("order_status_updated", { order_id: _id, new_status });

    res.status(200).json({ status: "success", order: updated });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// GET /api/shops/:shop_id/orders — Vendor fetches orders (optional ?status=PLACED)
app.get("/api/shops/:shop_id/orders", async (req, res) => {
  try {
    const shop_id = toObjectId(req.params.shop_id);
    if (!shop_id) return res.status(400).json({ error: "Invalid shop_id" });

    const filter = { shop_id };
    if (req.query.status) filter.status = req.query.status;

    const orders = await col("orders").find(filter).sort({ created_at: -1 }).toArray();
    const orderIds = orders.map(o => o._id);

    const items = await col("order_items")
      .aggregate([
        { $match: { order_id: { $in: orderIds } } },
        { $lookup: { from: "products", localField: "product_id", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        { $project: { order_id: 1, quantity: 1, "product.name": 1, "product.price": 1 } },
      ])
      .toArray();

    // Group items by order_id
    const itemsByOrder = {};
    items.forEach(item => {
      const key = item.order_id.toString();
      if (!itemsByOrder[key]) itemsByOrder[key] = [];
      itemsByOrder[key].push(item);
    });

    const result = orders.map(order => ({
      ...order,
      items: itemsByOrder[order._id.toString()] || [],
    }));

    res.status(200).json({ orders: result });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/:order_id — Single order with its items
app.get("/api/orders/:order_id", async (req, res) => {
  try {
    const _id = toObjectId(req.params.order_id);
    if (!_id) return res.status(400).json({ error: "Invalid order_id" });

    const order = await col("orders").findOne({ _id });
    if (!order) return res.status(404).json({ error: "Order not found" });

    const items = await col("order_items")
      .aggregate([
        { $match: { order_id: _id } },
        { $lookup: { from: "products", localField: "product_id", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        { $project: { quantity: 1, "product.name": 1, "product.price": 1 } },
      ])
      .toArray();

    res.status(200).json({ order, items });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});


// ═════════════════════════════════════════════
// QUEUE POSITION
// GET /api/orders/:order_id/queue-position
// ═════════════════════════════════════════════
app.get("/api/orders/:order_id/queue-position", async (req, res) => {
  try {
    const _id = toObjectId(req.params.order_id);
    if (!_id) return res.status(400).json({ error: "Invalid order_id" });

    const order = await col("orders").findOne({ _id });
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Count PLACED orders in the same shop created before this one
    const position = await col("orders").countDocuments({
      shop_id: order.shop_id,
      status: "PLACED",
      created_at: { $lt: order.created_at },
    });

    res.status(200).json({
      order_id: _id,
      queue_position: position,   // 0 = you're next
      your_status: order.status,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get queue position" });
  }
});


// ═════════════════════════════════════════════
// HTTP SERVER + SOCKET.IO
// ═════════════════════════════════════════════
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Vendor joins their shop room → receives "new_order" events live
  // Frontend: socket.emit("join_shop", { shop_id: "..." })
  socket.on("join_shop", ({ shop_id }) => {
    if (!shop_id) return;
    socket.join(`shop_${shop_id}`);
    console.log(`🏪 Vendor joined room: shop_${shop_id}`);
  });

  // Customer joins personal room → receives "order_status_updated" events
  // Frontend: socket.emit("join_customer", { user_id: "phone_or_id" })
  socket.on("join_customer", ({ user_id }) => {
    if (!user_id) return;
    socket.join(`customer_${user_id}`);
    console.log(`👤 Customer joined room: customer_${user_id}`);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ─────────────────────────────────────────────
// Socket.IO Events Reference
//
// SERVER → CLIENT:
//   "new_order"            → shop_<id>           payload: { order, items }
//   "order_status_updated" → shop_<id>            payload: { order_id, new_status }
//                          → customer_<user_id>   payload: { order_id, new_status }
//
// CLIENT → SERVER:
//   "join_shop"     payload: { shop_id }  — vendor subscribes to live orders
//   "join_customer" payload: { user_id }  — customer subscribes to status updates
// ─────────────────────────────────────────────

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend API Server running on http://localhost:${PORT}`);
});