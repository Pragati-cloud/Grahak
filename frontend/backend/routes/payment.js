import express from "express";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";

// Legacy Payment Schema used by UI Token generation
const tempPaymentSchema = new mongoose.Schema({
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  token: { type: String, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const TempPayment = mongoose.models.TempPayment || mongoose.model("TempPayment", tempPaymentSchema);

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "YOUR_KEY_ID",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET",
});

// CREATE RAZORPAY ORDER
router.post("/orders", async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const options = {
      amount: amount * 100, // converting to paise
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// CREATE CASH ORDER
router.post("/orders/cash", async (req, res) => {
  try {
    const { amount, currency } = req.body;
    let token = 'SH-CS-' + uuidv4().split('-')[0].toUpperCase();

    const newPayment = await TempPayment.create({
      razorpay_order_id: "CASH_" + Date.now(),
      razorpay_payment_id: "CASH_" + Date.now(),
      razorpay_signature: "CASH_" + Date.now(),
      amount,
      currency: currency || "INR",
      token,
      status: "cash",
    });

    res.status(200).json({ status: 'success', token });
  } catch (error) {
    res.status(500).json({ error: "Failed to process cash path" });
  }
});

// SECURELY VERIFY SIGNATURE
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET";
    
    // Explicit HMAC verification exactly as requested:
    // generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret);
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      // Payment is successful and authentic
      let token = 'SH-ON-' + uuidv4().split('-')[0].toUpperCase();

      const newPayment = await TempPayment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount,
        currency,
        token,
        status: "success",
      });

      res.status(200).json({ status: 'success', message: 'Payment verified successfully', token });
    } else {
      res.status(400).json({ status: "failure", message: "Invalid signature payload" });
    }
  } catch (error) {
    res.status(500).json({ error: "Verification processing failed" });
  }
});

// GET ALL PAYMENTS
router.get("/", async (req, res) => {
  const payments = await Payment.find();
  res.json(payments);
});

export default router;