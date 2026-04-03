import express from "express";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";

const router = express.Router();

// CREATE PAYMENT
router.post("/", async (req, res) => {
  const payment = await Payment.create(req.body);

  // Update order payment status
  await Order.findByIdAndUpdate(req.body.orderId, {
    paymentStatus: "PAID",
    paymentId: payment._id
  });

  res.json(payment);
});

// GET ALL
router.get("/", async (req, res) => {
  const payments = await Payment.find();
  res.json(payments);
});

// GET ONE
router.get("/:id", async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  res.json(payment);
});

export default router;