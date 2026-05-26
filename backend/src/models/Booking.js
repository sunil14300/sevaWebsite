const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, required: true },
    customerMobile: { type: String, required: true },
    customerAddress: { type: String, required: true },
    serviceDate: { type: Date, required: true },
    description: { type: String },
    // agreedPrice: { type: Number, required: true },
    commission: { type: Number, required: true }, // 7% of agreedPrice
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    rating: { type: Number, min: 1, max: 5 },
    ratingComment: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
