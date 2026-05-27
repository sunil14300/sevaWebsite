const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    registrationId: { type: String, unique: true, required: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    dob: { type: Date, required: true },
    mobile: { type: String, required: true },
    email: { type: String, trim: true, lowercase: true },
    state: { type: String, required: true },
    role: {
      type: String,
      enum: ["worker", "admin"],
      default: "worker",
      required: true,
    },
    verified: { type: Boolean, default: false },

loginOTP: {
 type: String,
 default: "",
},

otpExpiry: {
 type: Date,
 default: null,
},

lastAdminLogin: {
 type: Date,
},
    // Worker-only fields
    occupation: {
      type: String,
      enum: [
        "Plumber", "Electrician", "Painter", "Mechanic", "Cook",
        "Carpenter", "Barber", "Sweeper", "Mason", "Driver",
        "Helper", "Cobbler", "Technical Person", "Labour","Beauty Parlour", "Others",
      ],
      required: function () { return this.role === "worker"; },
    },
    occupationOther: {
      type: String,
      trim: true,
      required: function () { return this.role === "worker" && this.occupation === "Others"; },
    },
    aadhaar: {
      type: String,
      required: function () { return this.role === "worker"; },
    },
    pan: { type: String },
    priceCharge: {
      type: String,
      required: function () { return this.role === "worker"; },
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    available: { type: Boolean, default: true },
    profilePhoto: { type: String, default: "" },
    // Geolocation
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    locationUpdatedAt: { type: Date },
  },
  { timestamps: true }
);

workerSchema.index({ occupation: 1, state: 1, available: 1 });
workerSchema.index({ name: "text", occupation: "text", address: "text" });
workerSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Worker", workerSchema);
