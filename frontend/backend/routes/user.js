import express from "express";
import User from "../models/User.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

// READ ALL
router.get("/", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// READ ONE
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

export default router;