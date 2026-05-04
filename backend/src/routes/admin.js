const express = require("express");
const auth = require("../middleware/auth");
const Worker = require("../models/Worker");
const Customer = require("../models/Customer");
const Booking = require("../models/Booking");

const router = express.Router();

// Admin middleware — check both collections
const adminOnly = async (req, res, next) => {
  try {
    let user = await Worker.findById(req.worker.id);
    if (!user) user = await Customer.findById(req.worker.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }
    next();
  } catch {
    res.status(500).json({ error: "Server error." });
  }
};

// GET /api/admin/users — list all users (workers, customers, or both)
router.get("/users", auth, adminOnly, async (req, res) => {
  try {
    const { role, verified } = req.query;

    if (role === "worker") {
      const filter = { role: "worker" };
      if (verified !== undefined) filter.verified = verified === "true";
      const users = await Worker.find(filter).select("-passwordHash").sort({ createdAt: -1 });
      return res.json({ users, total: users.length });
    }

    if (role === "customer") {
      const filter = {};
      if (verified !== undefined) filter.verified = verified === "true";
      const users = await Customer.find(filter).select("-passwordHash").sort({ createdAt: -1 });
      return res.json({ users, total: users.length });
    }

    // All users — merge both collections
    const workerFilter = {};
    const customerFilter = {};
    if (verified !== undefined) {
      workerFilter.verified = verified === "true";
      customerFilter.verified = verified === "true";
    }
    const [workers, customers] = await Promise.all([
      Worker.find(workerFilter).select("-passwordHash").sort({ createdAt: -1 }),
      Customer.find(customerFilter).select("-passwordHash").sort({ createdAt: -1 }),
    ]);
    const users = [...workers, ...customers].sort((a, b) => b.createdAt - a.createdAt);
    res.json({ users, total: users.length });
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

// GET /api/admin/users/:id — single user detail (check both collections)
router.get("/users/:id", auth, adminOnly, async (req, res) => {
  try {
    let user = await Worker.findById(req.params.id).select("-passwordHash");
    if (!user) user = await Customer.findById(req.params.id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

// PATCH /api/admin/users/:id — update user (check both collections)
router.patch("/users/:id", auth, adminOnly, async (req, res) => {
  try {
    const workerAllowed = ["verified", "name", "address", "mobile", "email", "state", "occupation", "priceCharge", "available", "role"];
    const customerAllowed = ["verified", "name", "address", "mobile", "email", "state"];

    // Try worker first
    let user = await Worker.findById(req.params.id);
    if (user) {
      const updates = {};
      workerAllowed.forEach((key) => {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      });
      user = await Worker.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-passwordHash");
      return res.json(user);
    }

    // Try customer
    user = await Customer.findById(req.params.id);
    if (user) {
      const updates = {};
      customerAllowed.forEach((key) => {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      });
      user = await Customer.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-passwordHash");
      return res.json(user);
    }

    return res.status(404).json({ error: "User not found." });
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

// DELETE /api/admin/users/:id — delete user (check both collections)
router.delete("/users/:id", auth, adminOnly, async (req, res) => {
  try {
    let user = await Worker.findByIdAndDelete(req.params.id);
    if (!user) user = await Customer.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ message: "User deleted." });
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

// GET /api/admin/bookings — all bookings
router.get("/bookings", auth, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find().populate("workerId", "name registrationId occupation").sort({ createdAt: -1 });
    res.json({ bookings, total: bookings.length });
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

// PATCH /api/admin/bookings/:id — update booking status
router.patch("/bookings/:id", auth, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    res.json(booking);
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

// DELETE /api/admin/bookings/:id
router.delete("/bookings/:id", auth, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    res.json({ message: "Booking deleted." });
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

// GET /api/admin/stats
router.get("/stats", auth, adminOnly, async (req, res) => {
  try {
    const [totalWorkers, totalCustomers, totalBookings, pendingVerifications, revenueData] = await Promise.all([
      Worker.countDocuments({ role: "worker" }),
      Customer.countDocuments(),
      Booking.countDocuments(),
      Worker.countDocuments({ verified: false }),
      Booking.aggregate([
        { $group: {
          _id: null,
          totalRevenue: { $sum: "$agreedPrice" },
          totalCommission: { $sum: "$commission" },
          completedRevenue: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$agreedPrice", 0] } },
          completedCommission: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$commission", 0] } },
        }}
      ]),
    ]);
    const revenue = revenueData[0] || { totalRevenue: 0, totalCommission: 0, completedRevenue: 0, completedCommission: 0 };
    res.json({ totalWorkers, totalCustomers, totalBookings, pendingVerifications, ...revenue });
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
