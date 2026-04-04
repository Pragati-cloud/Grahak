import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { check } from "express-validator";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a user (Step 1 for vendors)
router.post("/register", [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check("password", "Please enter a password with 6 or more characters").isLength({ min: 6 })
], register);

// @route   POST /api/auth/login
// @desc    Login user & get token
router.post("/login", login);

export default router;
