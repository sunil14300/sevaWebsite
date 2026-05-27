require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env")
});

const connectDB = require("../config/db");
const Worker = require("../models/Worker");

const createAdmin = async () => {

  try {

    await connectDB();

    const existingAdmin =
      await Worker.findOne({
        registrationId: "ADMIN001"
      });

    if (existingAdmin) {

      console.log(
        "⚠️ Admin already exists!"
      );

      console.log(
        "Registration ID: ADMIN001"
      );

      console.log(
        "DOB: 2000-01-01"
      );

      process.exit(0);

    }

    await Worker.create({

      registrationId:
        "ADMIN001",

      name:
        "Admin",

      address:
        "Seva HQ",

      dob:
        new Date(
          "2000-01-01"
        ),

      mobile:
        "9999999999",

      email:
        "sunil.don14300@gmail.com",

      state:
        "Delhi",

      role:
        "admin",

      verified:
        true,

      loginOTP:
        "",

      otpExpiry:
        null,

      lastAdminLogin:
        null

    });

    console.log(
      "✅ Admin created successfully"
    );

    console.log(
      "Registration ID : ADMIN001"
    );

    console.log(
      "DOB : 2000-01-01"
    );

    console.log(
      "Email OTP verification enabled"
    );

    process.exit(0);

  }
  catch (err) {

    console.log(
      "❌ Error creating admin"
    );

    console.log(err);

    process.exit(1);

  }

};

createAdmin();