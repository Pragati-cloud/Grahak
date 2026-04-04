import jwt from "jsonwebtoken";
import Vendor from "../models/Vendor.js";

// 1. Verify standard JWT presence
export const requireAuth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
};

// 2. Role-based access control (e.g., admin only)
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access forbidden. Insufficient permissions." });
    }
    next();
  };
};

// 3. Strict Vendor Verification Guard (Bonus Requirement)
export const requireVendorApproved = async (req, res, next) => {
  if (req.user.role !== "vendor") return res.status(403).json({ error: "Not a vendor." });
  
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor || vendor.verificationStatus !== "approved") {
      return res.status(403).json({ 
        error: "Access Denied: Your account is pending verification or rejected. You cannot access dashboard features yet." 
      });
    }
    req.vendor = vendor;
    next();
  } catch (err) {
    res.status(500).json({ error: "Server error checking vendor status." });
  }
};
