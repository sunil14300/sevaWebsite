const express = require("express");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/notifications — get user's notifications
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.worker.id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.worker.id, read: false });
    res.json({ notifications, unreadCount });
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.worker.id, read: false }, { read: true });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

// PATCH /api/notifications/:id/read — mark one as read
router.patch("/:id/read", auth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.worker.id },
      { read: true }
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
