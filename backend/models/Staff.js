const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  staffId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  availabilityStatus: {
    type: String,
    enum: ["Available", "Busy", "On Leave"],
    default: "Available"
  },
  currentLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  }
}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);
