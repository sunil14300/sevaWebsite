const express = require("express");
const { body, validationResult } = require("express-validator");
const Booking = require("../models/Booking");
const Worker = require("../models/Worker");
const Customer = require("../models/Customer");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

const router = express.Router();

const COMMISSION_RATE = 0; // 0% — free for now

// POST /api/bookings (authenticated customer)
router.post(
  "/",
  auth,
  [
    body("workerId").trim().notEmpty(),
    body("customerName").trim().notEmpty().isLength({ max: 100 }),
    body("customerMobile").trim().notEmpty().isLength({ min: 10, max: 15 }),
    body("customerAddress").trim().notEmpty().isLength({ max: 300 }),
    body("serviceDate").isISO8601(),
    body("description").optional({ checkFalsy: true }).trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const worker = await Worker.findOne({ registrationId: req.body.workerId });
      if (!worker) return res.status(404).json({ error: "Worker not found." });
      if (!worker.available) return res.status(400).json({ error: "Worker is not available." });

      
      const commission = 0; // free for now

      const booking = await Booking.create({
        workerId: worker._id,
        customerId: req.worker.id,
        customerName: req.body.customerName,
        customerMobile: req.body.customerMobile,
        customerAddress: req.body.customerAddress,
        serviceDate: req.body.serviceDate,
        description: req.body.description,
        
        commission,
      });

      // Notify worker about new booking
      await Notification.create({
        userId: worker._id,
        type: "booking_created",
        title: "New Booking Request",
        message: `${req.body.customerName} booked you for ${new Date(req.body.serviceDate).toLocaleDateString()}. Address: ${req.body.customerAddress}.`,
        bookingId: booking._id,
      });

      res.status(201).json(booking);
    } catch {
      res.status(500).json({ error: "Server error." });
    }
  }
);

// GET /api/bookings/my — worker's own bookings (authenticated)
router.get("/my", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ workerId: req.worker.id })
      .populate("customerId", "name registrationId")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

// GET /api/bookings/customer — customer's own bookings
router.get("/customer", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.worker.id })
      .populate("workerId", "name registrationId occupation occupationOther priceCharge profilePhoto")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

// PATCH /api/bookings/:id/status (authenticated worker)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, workerId: req.worker.id },
      { status: req.body.status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: "Booking not found." });

    // Send notification to customer based on status change
    if (req.body.status === "confirmed") {
      const worker = await Worker.findById(req.worker.id);
      await Notification.create({
        userId: booking.customerId,
        type: "booking_accepted",
        title: "Booking Accepted!",
        message:
`${req.body.customerName}
booked you for
${new Date(req.body.serviceDate).toLocaleDateString()}.
Address:
${req.body.customerAddress}.`,
        bookingId: booking._id,
      });
    } else if (req.body.status === "cancelled") {
      const worker = await Worker.findById(req.worker.id);
      await Notification.create({
        userId: booking.customerId,
        type: "booking_declined",
        title: "Booking Declined",
        message: `${worker?.name || "Worker"} declined your booking request for ${new Date(booking.serviceDate).toLocaleDateString()}.`,
        bookingId: booking._id,
      });
    } else if (req.body.status === "completed") {
      const worker = await Worker.findById(req.worker.id);
      await Notification.create({
        userId: booking.customerId,
        type: "booking_completed",
        title: "Work Completed — Rate Your Experience",
        message: `${worker?.name || "Worker"} marked the job as completed. Please rate your experience!`,
        bookingId: booking._id,
      });
    }

    res.json(booking);
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

// PATCH /api/bookings/:id/rate (authenticated customer)
router.patch("/:id/rate", auth, async (req, res) => {
  try {
    const { rating, ratingComment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be 1-5." });

    const booking = await Booking.findOne({ _id: req.params.id, customerId: req.worker.id });
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (booking.status !== "completed") return res.status(400).json({ error: "Can only rate completed bookings." });
    if (booking.rating) return res.status(400).json({ error: "Already rated." });

    booking.rating = rating;
    booking.ratingComment = ratingComment || "";
    await booking.save();

    // Update worker's average rating
    const worker = await Worker.findById(booking.workerId);
    if (worker) {
      const newTotal = worker.totalRatings + 1;
      const newRating = ((worker.rating * worker.totalRatings) + rating) / newTotal;
      worker.rating = Math.round(newRating * 10) / 10;
      worker.totalRatings = newTotal;
      await worker.save();
    }

    res.json(booking);
  } catch {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
