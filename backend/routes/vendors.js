import express from "express";
import Vendor from "../models/Vendor.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  const vendor = await Vendor.create(req.body);
  res.json(vendor);
});

// READ ALL
router.get("/", async (req, res) => {
  const vendors = await Vendor.find();
  res.json(vendors);
});

// READ ONE
router.get("/:id", async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  res.json(vendor);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(vendor);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await Vendor.findByIdAndDelete(req.params.id);
  res.json({ message: "Vendor deleted" });
});

export default router;