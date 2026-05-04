require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Worker = require("../models/Worker");

const createAdmin = async () => {
  await connectDB();

  const existing = await Worker.findOne({ registrationId: "ADMIN001" });
  if (existing) {
    console.log("Admin already exists! Login with:");
    console.log("  Registration ID: ADMIN001");
    console.log("  DOB: 2000-01-01");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash("admin123", 10);

  await Worker.create({
    registrationId: "ADMIN001",
    name: "Admin",
    address: "Seva HQ",
    dob: new Date("2000-01-01"),
    mobile: "9999999999",
    email: "admin@seva.com",
    state: "Delhi",
    role: "admin",
    verified: true,
    passwordHash,
  });

  console.log("✅ Admin created successfully!");
  console.log("  Registration ID: ADMIN001");
  console.log("  DOB: 2000-01-01");
  process.exit(0);
};

createAdmin().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
