const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Staff = require("../models/Staff");
const isAuthenticated = require("../middleware/authmiddleware");
const isStaff = require("../middleware/staffmiddleware");

// ================= GET MY ASSIGNED TASKS =================
router.get("/my-tasks", isAuthenticated, isStaff, async (req, res) => {
  try {
    const bookings = await Booking.find({ staffId: req.session.user.id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= ACCEPT TASK =================
router.put("/accept/:bookingId", isAuthenticated, isStaff, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (String(booking.staffId) !== String(req.session.user.id)) {
      return res.status(403).json({ message: "This task is not assigned to you" });
    }

    if (booking.status !== "Assigned") {
      return res.status(400).json({ message: "Can only accept tasks with 'Assigned' status" });
    }

    booking.status = "Accepted";
    await booking.save();

    // Ensure staff is marked Busy when they accept a task
    const staff = await Staff.findById(req.session.user.id);
    if (staff && staff.availabilityStatus !== "Busy") {
      staff.availabilityStatus = "Busy";
      await staff.save();
    }

    const updated = await Booking.findById(booking._id).populate("userId", "name email");
    res.status(200).json({ message: "Task accepted", booking: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE TASK STATUS =================
// Flow: Accepted -> In Progress -> Completed
router.put("/update-status/:bookingId", isAuthenticated, isStaff, async (req, res) => {
  try {
    const { status } = req.body;
    const validTransitions = {
      "Accepted": ["In Progress"],
      "In Progress": ["Completed"]
    };

    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (String(booking.staffId) !== String(req.session.user.id)) {
      return res.status(403).json({ message: "This task is not assigned to you" });
    }

    const allowed = validTransitions[booking.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from '${booking.status}' to '${status}'`
      });
    }

    booking.status = status;

    // When starting service, ensure staff is marked Busy
    if (status === "In Progress") {
      const staff = await Staff.findById(req.session.user.id);
      if (staff && staff.availabilityStatus !== "Busy") {
        staff.availabilityStatus = "Busy";
        await staff.save();
      }
    }

    // When completed, mark staff as Available again
    if (status === "Completed") {
      const staff = await Staff.findById(req.session.user.id);
      if (staff) {
        staff.availabilityStatus = "Available";
        await staff.save();
      }
    }

    await booking.save();

    const updated = await Booking.findById(booking._id).populate("userId", "name email");
    res.status(200).json({ message: "Status updated", booking: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE STAFF LOCATION =================
router.put("/update-location", isAuthenticated, isStaff, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (lat == null || lng == null) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const staff = await Staff.findById(req.session.user.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    staff.currentLocation = { lat, lng };
    await staff.save();

    res.status(200).json({ message: "Location updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
