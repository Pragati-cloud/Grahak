import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// A simple wait time estimator
const calculateWaitTime = (existingOrders, items) => {
  return (items?.length || 1) * 5 + (existingOrders?.length || 0) * 10;
};

// CREATE ORDER
router.post("/", async (req, res) => {
  try {
    const io = req.app.get("io");

    const { vendorId, items, totalAmount } = req.body;

    const existingOrders = await Order.find({ vendorId, orderStatus: { $in: ["PLACED", "PREPARING"] } });
    const estimatedTime = calculateWaitTime(existingOrders, items);

    const count = await Order.countDocuments({ vendorId });
    const token = count + 1;

    const order = await Order.create({
      ...req.body,
      orderId: "ORD-" + Date.now(),
      tokenNumber: token,
      estimatedTime
    });

    // 🔥 Emit to vendor
    if (io) io.emit("new-order", order);

    res.json(order);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL ORDERS
router.get("/", async (req, res) => {
  const orders = await Order.find().populate("vendorId");
  res.json(orders);
});

// GET BY VENDOR
router.get("/vendor/:vendorId", async (req, res) => {
  const orders = await Order.find({ vendorId: req.params.vendorId });
  res.json(orders);
});

// GET ONE
router.get("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json(order);
});

// UPDATE STATUS
router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(order);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Order deleted" });
});

export default router;