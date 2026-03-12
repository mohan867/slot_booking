const express = require("express");
const router = express.Router();
const Staff = require("../models/Staff");
const bcrypt = require("bcryptjs");

// ================= STAFF LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const staff = await Staff.findOne({ email });
    if (!staff) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Store staff in session
    req.session.user = {
      id: staff._id,
      staffId: staff.staffId,
      name: staff.name,
      email: staff.email,
      specialization: staff.specialization,
      role: "staff"
    };

    res.status(200).json({
      message: "Login successful",
      user: req.session.user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= STAFF LOGOUT =================
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logout successful" });
  });
});

// ================= GET STAFF PROFILE =================
router.get("/profile", (req, res) => {
  if (req.session && req.session.user && req.session.user.role === "staff") {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

module.exports = router;
