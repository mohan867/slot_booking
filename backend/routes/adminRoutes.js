const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Staff = require("../models/Staff");
const isAuthenticated = require("../middleware/authmiddleware");
const isAdmin = require("../middleware/adminmiddleware");

// ================= VIEW ALL BOOKINGS =================
router.get("/bookings", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate("staffId", "name phone email specialization staffId")
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
    if (status && ["Pending", "Accepted", "Rejected", "Assigned", "In Progress", "Completed"].includes(status)) {
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

    // Return updated booking with populated user and staff
    const updatedBooking = await Booking.findById(booking._id)
      .populate("userId", "name email")
      .populate("staffId", "name phone email specialization staffId");

    res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= ASSIGN STAFF TO BOOKING =================
router.put("/assign-staff/:bookingId", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { staffId } = req.body;
    if (!staffId) {
      return res.status(400).json({ message: "Staff ID is required" });
    }

    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "Rejected" || booking.status === "Completed") {
      return res.status(400).json({ message: "Cannot assign staff to a " + booking.status.toLowerCase() + " booking" });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    if (staff.availabilityStatus !== "Available") {
      return res.status(400).json({ message: `Staff member is currently '${staff.availabilityStatus}' and cannot be assigned` });
    }

    booking.staffId = staffId;
    booking.assignedBy = req.session.user.id;
    booking.assignedAt = new Date();
    booking.status = "Assigned";
    await booking.save();

    // Mark staff as Busy
    staff.availabilityStatus = "Busy";
    await staff.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("userId", "name email")
      .populate("staffId", "name phone email specialization staffId");

    res.status(200).json({
      message: "Staff assigned successfully",
      booking: updatedBooking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= GET AVAILABLE STAFF =================
router.get("/available-staff", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const staff = await Staff.find({ availabilityStatus: "Available" })
      .select("name phone email specialization staffId availabilityStatus");
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
