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
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"], // 🔥 professional
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
