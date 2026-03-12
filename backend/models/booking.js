const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true
    },
    issue: {
      type: String,
      required: true,
      trim: true
    },
    issueCategories: {
      type: [String],
      default: []
    },
    serviceDate: {
      type: String,
      required: true
    },
    serviceTime: {
      type: String,
      required: true
    },
    doorstepDelivery: {
      type: Boolean,
      default: false
    },
    pickupLocation: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String, default: "" }
    },
    doorstepCharge: {
      type: Number,
      default: 0
    },
    distanceKm: {
      type: Number,
      default: 0
    },
    // Staff assignment
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    assignedAt: {
      type: Date,
      default: null
    },
    // Payment
    amount: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid"
    },
    // Full status flow
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Assigned", "In Progress", "Completed"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
