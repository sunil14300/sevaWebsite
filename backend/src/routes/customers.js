const express = require("express");
const auth = require("../middleware/auth");
const Customer = require("../models/Customer");

const router = express.Router();

// GET /api/customers/me/profile — get own profile (authenticated customer)
router.get("/me/profile", auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.worker.id).select("-passwordHash");
    if (!customer) return res.status(404).json({ error: "User not found." });
    res.json(customer);
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

// PATCH /api/customers/me — update own profile (authenticated customer)
router.patch("/me", auth, async (req, res) => {
  try {
    const allowed = ["address", "mobile", "email", "state", "profilePhoto"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const customer = await Customer.findByIdAndUpdate(req.worker.id, updates, { new: true })
      .select("-passwordHash");
    res.json(customer);
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
