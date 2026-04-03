import Vendor from "../models/Vendor.js";

// Step 2: Add Phone Number
export const registerProfile = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number required" });

    let vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ error: "Vendor profile missing" });

    vendor.phone = phone;
    await vendor.save();

    res.json({ message: "Phone added successfully", vendor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Step 3: Upload Documents & Shop Details
export const uploadDocuments = async (req, res) => {
  try {
    const { shopName, gstNumber, address, category } = req.body;
    
    const shopPhotoUrl = req.files?.shopPhoto?.[0]?.path;
    const governmentIdUrl = req.files?.govtId?.[0]?.path;

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ error: "Vendor profile not found" });

    vendor.shopDetails = { shopName, gstNumber, shopPhotoUrl, address, category };
    vendor.documents = { governmentIdUrl };
    
    await vendor.save();
    res.json({ message: "Documents and Shop details saved successfully.", vendor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Step 4: Submit Verification
export const submitVerification = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ error: "Vendor profile not found" });

    // Mark as pending
    vendor.verificationStatus = "pending";
    await vendor.save();

    res.json({ 
      message: "Your account will be verified within 24 hours.", 
      status: vendor.verificationStatus 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin Bonus: Approve Vendor
export const approveVendor = async (req, res) => {
  try {
    const { vendorId } = req.params; // Using Vendor document ID here
    const { status } = req.body; // 'approved' or 'rejected'

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }

    const vendor = await Vendor.findByIdAndUpdate(vendorId, { verificationStatus: status }, { new: true });
    res.json({ message: `Vendor successfully ${status}.`, vendor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
