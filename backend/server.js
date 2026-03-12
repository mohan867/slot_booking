require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");

// Routes
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const staffRoutes = require("./routes/staffRoutes");
const staffAuthRoutes = require("./routes/staffAuthRoutes");
const staffTaskRoutes = require("./routes/staffTaskRoutes");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
  credentials: true
}));
app.use(express.json());

// ✅ SESSION CONFIGURATION
app.use(
  session({
    secret: "vehicle_service_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000 // 1 hour
    }
  })
);

// ================= MONGODB CONNECTION =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/staff-auth", staffAuthRoutes);
app.use("/api/staff-tasks", staffTaskRoutes);

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("Vehicle Service API Running");
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
