const express = require("express");
const router = express.Router();
const Staff = require("../models/Staff");
const bcrypt = require("bcryptjs");
const isAuthenticated = require("../middleware/authmiddleware");
const isAdmin = require("../middleware/adminmiddleware");

// ================= ADD NEW STAFF =================
router.post("/add", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { staffId, name, phone, email, password, specialization } = req.body;

    if (!staffId || !name || !phone || !email || !password || !specialization) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await Staff.findOne({ $or: [{ email }, { staffId }] });
    if (existing) {
      return res.status(400).json({ message: "Staff with this email or staffId already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const staff = new Staff({
      staffId,
      name,
      phone,
      email,
      password: hashedPassword,
      specialization
    });

    await staff.save();

    res.status(201).json({ message: "Staff member added successfully", staff: { ...staff.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= GET ALL STAFF =================
router.get("/all", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const staffList = await Staff.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(staffList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE STAFF =================
router.put("/update/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, phone, email, specialization, availabilityStatus, password } = req.body;

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    if (email && email !== staff.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      const existing = await Staff.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    if (name) staff.name = name;
    if (phone) staff.phone = phone;
    if (email) staff.email = email;
    if (specialization) staff.specialization = specialization;
    if (availabilityStatus && ["Available", "Busy", "On Leave"].includes(availabilityStatus)) {
      staff.availabilityStatus = availabilityStatus;
    }
    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      staff.password = await bcrypt.hash(password, salt);
    }

    await staff.save();

    res.status(200).json({
      message: "Staff updated successfully",
      staff: { ...staff.toObject(), password: undefined }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= DELETE STAFF =================
router.delete("/delete/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
