import express from "express";
import mongoose from "mongoose";
import Menu from "../models/Menu.js";

const router = express.Router();

// CREATE / UPDATE MENU
router.post("/", async (req, res) => {
  const menu = await Menu.create(req.body);
  res.json(menu);
});

// GET ALL MENUS (or first for demo)
router.get("/", async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json([]);
  const menu = await Menu.findOne();
  if (!menu) return res.json([]);
  res.json(menu.items);
});

// GET BY VENDOR
router.get("/:vendorId", async (req, res) => {
  const menu = await Menu.findOne({ vendorId: req.params.vendorId });
  res.json(menu);
});

// UPDATE MENU
router.put("/:id", async (req, res) => {
  const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(menu);
});

export default router;