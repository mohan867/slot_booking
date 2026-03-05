const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const isAuthenticated = require("../middleware/authmiddleware");
const isAdmin = require("../middleware/adminmiddleware");

// ================= VIEW ALL BOOKINGS =================
router.get("/bookings", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= ACCEPT BOOKING =================
router.put("/booking/accept/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "Accepted";
    await booking.save();

    res.status(200).json({
      message: "Booking accepted successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= REJECT BOOKING =================
router.put("/booking/reject/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "Rejected";
    await booking.save();

    res.status(200).json({
      message: "Booking rejected successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= ADMIN UPDATE BOOKING =================
router.put("/booking/update/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const {
      vehicleNumber, issue, issueCategories,
      serviceDate, serviceTime, status,
      doorstepDelivery, pickupLocation, doorstepCharge, distanceKm
    } = req.body;

    // Update basic fields if provided
    if (vehicleNumber) booking.vehicleNumber = vehicleNumber;
    if (issue) booking.issue = issue;
    if (issueCategories) booking.issueCategories = issueCategories;
    if (serviceDate) booking.serviceDate = serviceDate;
    if (serviceTime) booking.serviceTime = serviceTime;
    if (status && ["Pending", "Accepted", "Rejected"].includes(status)) {
      booking.status = status;
    }

    // Update doorstep delivery fields
    if (typeof doorstepDelivery === 'boolean') {
      booking.doorstepDelivery = doorstepDelivery;
    }
    if (pickupLocation && pickupLocation.lat) {
      booking.pickupLocation = {
        lat: pickupLocation.lat,
        lng: pickupLocation.lng,
        address: pickupLocation.address || ""
      };
    }
    if (typeof doorstepCharge === 'number') booking.doorstepCharge = doorstepCharge;
    if (typeof distanceKm === 'number') booking.distanceKm = distanceKm;

    await booking.save();

    // Return updated booking with populated user
    const updatedBooking = await Booking.findById(booking._id)
      .populate("userId", "name email");

    res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
