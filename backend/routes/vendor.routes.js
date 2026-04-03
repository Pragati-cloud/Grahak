import express from "express";
import { requireAuth, requireRole, requireVendorApproved } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { registerProfile, uploadDocuments, submitVerification, approveVendor } from "../controllers/vendor.controller.js";
import Vendor from "../models/Vendor.js";

const router = express.Router();

// Step 2: Add phone number to profile
router.post("/register-profile", requireAuth, registerProfile);

// Step 3: Upload shop photo and government ID
router.post(
  "/upload-documents", 
  requireAuth, 
  upload.fields([
    { name: "shopPhoto", maxCount: 1 }, 
    { name: "govtId", maxCount: 1 }
  ]), 
  uploadDocuments
);

// Step 4: Submit for verification
router.post("/submit-verification", requireAuth, submitVerification);

// Check current verification status pipeline
router.get("/status", requireAuth, async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    res.json({ status: vendor ? vendor.verificationStatus : "none" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// BONUS ROUTES
// -------------------------------------------------------------

// Admin: Approve Vendor Endpoint
router.post("/approve/:vendorId", requireAuth, requireRole(["admin"]), approveVendor);

// Strict Protected Vendor Dashboard Route - Returns 403 unless approved!
router.get("/dashboard", requireAuth, requireVendorApproved, (req, res) => {
  res.json({ message: "Welcome to the real vendor dashboard!", vendor: req.vendor });
});

export default router;
