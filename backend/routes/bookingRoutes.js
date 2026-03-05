const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const isAuthenticated = require("../middleware/authmiddleware");

// ================= AVAILABLE TIME SLOTS =================
const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM"
];

const MAX_BOOKINGS_PER_SLOT = 3; // Maximum bookings per time slot

// ================= GET AVAILABLE SLOTS =================
router.get("/available-slots", isAuthenticated, async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Get all bookings for the selected date
    const bookings = await Booking.find({
      serviceDate: date,
      status: { $ne: "Rejected" } // Don't count rejected bookings
    });

    // Count bookings per time slot
    const slotCounts = {};
    bookings.forEach(booking => {
      slotCounts[booking.serviceTime] = (slotCounts[booking.serviceTime] || 0) + 1;
    });

    // Build available slots with capacity info
    const availableSlots = TIME_SLOTS.map(slot => ({
      time: slot,
      booked: slotCounts[slot] || 0,
      available: MAX_BOOKINGS_PER_SLOT - (slotCounts[slot] || 0),
      isAvailable: (slotCounts[slot] || 0) < MAX_BOOKINGS_PER_SLOT
    }));

    res.status(200).json({
      date,
      slots: availableSlots,
      maxPerSlot: MAX_BOOKINGS_PER_SLOT
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= CREATE BOOKING =================
router.post("/create", isAuthenticated, async (req, res) => {
  try {
    const { vehicleNumber, issue, issueCategories, serviceDate, serviceTime, doorstepDelivery, pickupLocation, doorstepCharge, distanceKm } = req.body;

    // ✅ VALIDATION
    if (!vehicleNumber || !serviceDate || !serviceTime) {
      return res.status(400).json({
        message: "Vehicle number, service date, and time are required"
      });
    }

    if (!issue && (!issueCategories || issueCategories.length === 0)) {
      return res.status(400).json({
        message: "Please provide issue description or select issue categories"
      });
    }

    if (vehicleNumber.length < 5) {
      return res.status(400).json({
        message: "Invalid vehicle number"
      });
    }

    // Check slot availability
    const existingBookings = await Booking.countDocuments({
      serviceDate,
      serviceTime,
      status: { $ne: "Rejected" }
    });

    if (existingBookings >= MAX_BOOKINGS_PER_SLOT) {
      return res.status(400).json({
        message: "This time slot is fully booked. Please select another slot."
      });
    }

    const isDoorstep = Boolean(doorstepDelivery);

    const booking = new Booking({
      userId: req.session.user.id,
      vehicleNumber,
      issue: issue || "See issue categories",
      issueCategories: issueCategories || [],
      serviceDate,
      serviceTime,
      doorstepDelivery: isDoorstep,
      pickupLocation: pickupLocation && pickupLocation.lat ? {
        lat: pickupLocation.lat,
        lng: pickupLocation.lng,
        address: pickupLocation.address || ""
      } : {},
      doorstepCharge: isDoorstep ? (doorstepCharge || 0) : 0,
      distanceKm: isDoorstep ? (distanceKm || 0) : 0,
      status: "Pending"
    });

    await booking.save();

    res.status(201).json({
      message: "Service slot booked successfully",
      booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= GET USER BOOKINGS =================
router.get("/user", isAuthenticated, async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.session.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE/RESCHEDULE BOOKING =================
router.put("/update/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceDate, serviceTime, vehicleNumber, issue, issueCategories, doorstepDelivery, pickupLocation, doorstepCharge, distanceKm } = req.body;

    // Find the booking
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify ownership
    if (booking.userId.toString() !== req.session.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Only allow updates for Pending bookings
    if (booking.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending bookings can be updated"
      });
    }

    // If changing date/time, check availability
    if (serviceDate && serviceTime) {
      const existingBookings = await Booking.countDocuments({
        serviceDate,
        serviceTime,
        status: { $ne: "Rejected" },
        _id: { $ne: id } // Exclude current booking
      });

      if (existingBookings >= MAX_BOOKINGS_PER_SLOT) {
        return res.status(400).json({
          message: "This time slot is fully booked. Please select another slot."
        });
      }

      booking.serviceDate = serviceDate;
      booking.serviceTime = serviceTime;
    }

    // Update other fields if provided
    if (vehicleNumber) booking.vehicleNumber = vehicleNumber;
    if (issue) booking.issue = issue;
    if (issueCategories) booking.issueCategories = issueCategories;

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

    res.status(200).json({
      message: "Booking updated successfully",
      booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= DELETE/CANCEL BOOKING =================
router.delete("/cancel/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify ownership
    if (booking.userId.toString() !== req.session.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Only allow cancellation for Pending bookings
    if (booking.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending bookings can be cancelled"
      });
    }

    await Booking.findByIdAndDelete(id);

    res.status(200).json({ message: "Booking cancelled successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
