require('dns').setDefaultResultOrder('ipv4first'); // 🔥 IMPORTANT (fix DNS issue)

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const workerRoutes = require("./routes/workers");
const customerRoutes = require("./routes/customers");
const bookingRoutes = require("./routes/bookings");
const adminRoutes = require("./routes/admin");
const notificationRoutes = require("./routes/notifications");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

// Start server AFTER DB connects
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Seva API running on port ${PORT}`);
  });
});