const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    registrationId: { type: String, unique: true, required: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    dob: { type: Date, required: true },
    mobile: { type: String, required: true },
    email: { type: String, trim: true, lowercase: true },
    state: { type: String, required: true },
    role: { type: String, default: "customer", enum: ["customer"] },
    verified: { type: Boolean, default: false },
    profilePhoto: { type: String, default: "" },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

customerSchema.index({ name: "text", address: "text" });

module.exports = mongoose.model("Customer", customerSchema);
