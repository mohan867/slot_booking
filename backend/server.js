const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");

// Routes
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminroutes");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"], // Allow both frontend ports
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
require("dotenv").config();

// ================= MONGODB CONNECTION =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("Vehicle Service API Running");
});

// ================= SERVER START =================
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
