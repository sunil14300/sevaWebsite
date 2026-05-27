const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Worker = require("../models/Worker");
const Customer = require("../models/Customer");
const Notification = require("../models/Notification");
const sendAdminOTP =require("../utils/sendAdminOTP");

const router = express.Router();

// POST /api/auth/register
router.post("/register",
  [
    body("name").trim().notEmpty().isLength({ max: 100 }),
    body("address").trim().notEmpty().isLength({ max: 300 }),
    body("dob").isISO8601(),
    body("mobile").trim().notEmpty().isLength({ min: 10, max: 15 }),
    body("email").optional({ checkFalsy: true }).isEmail().normalizeEmail(),
    body("state").trim().notEmpty(),
    body("role").isIn(["worker", "customer"]),
    // Worker-only validations

    body("occupation").if(body("role").equals("worker")).trim().notEmpty(),
    body("occupationOther").if(body("occupation").equals("Others")).trim().notEmpty().isLength({ min: 2, max: 100 }),
    body("aadhaar").if(body("role").equals("worker")).trim().notEmpty().isLength({ min: 12, max: 12 }),
    body("pan").optional({ checkFalsy: true }).isLength({ min: 10, max: 10 }),
    body("priceCharge").if(body("role").equals("worker")).trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const isCustomer = req.body.role === "customer";
      const prefix = isCustomer ? "CUST" : "SEVA";
      const registrationId = prefix + Math.floor(100000 + Math.random() * 900000);

      const commonData = {
        registrationId,
        name: req.body.name,
        address: req.body.address,
        dob: req.body.dob,
        mobile: req.body.mobile,
        email: req.body.email,
        state: req.body.state,
      };

      let user;
      if (isCustomer) {
        user = await Customer.create({ ...commonData, role: "customer" });
      } else {
        const workerData = {
          ...commonData,
          role: "worker",
          occupation: req.body.occupation,
          aadhaar: req.body.aadhaar,
          pan: req.body.pan,
          priceCharge: req.body.priceCharge,
        };
        if (req.body.occupation === "Others" && req.body.occupationOther) {
          workerData.occupationOther = req.body.occupationOther;
        }
        user = await Worker.create(workerData);
      }

      // Notify all admins about the new registration
      const admins = await Worker.find({ role: "admin" }).select("_id");
      if (admins.length > 0) {
        const roleLabel = isCustomer ? "Customer" : "Worker";
        const notifType = isCustomer ? "new_customer_registered" : "new_worker_registered";
        await Notification.insertMany(
          admins.map((admin) => ({
            userId: admin._id,
            type: notifType,
            title: `New ${roleLabel} Registered`,
            message: `${user.name} (${user.registrationId}) has registered as a ${roleLabel.toLowerCase()}.`,
          }))
        );
      }

      const token = jwt.sign(
        { id: user._id, registrationId: user.registrationId, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const responseUser = {
        registrationId: user.registrationId,
        name: user.name,
        role: user.role,
        occupation: user.occupation,
      };
      if (user.occupationOther) {
        responseUser.occupationOther = user.occupationOther;
      }
      res.status(201).json({
        registrationId: user.registrationId,
        token,
        user: responseUser,
      });
    } catch (error) {
      if (error.code === 11000) return res.status(409).json({ error: "Duplicate entry." });
      res.status(500).json({ error: "Server error." });
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("registrationId").trim().notEmpty(),
    body("dob").isISO8601(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      // Check both collections
      let user = await Worker.findOne({ registrationId: req.body.registrationId });
      if (!user) {
        user = await Customer.findOne({ registrationId: req.body.registrationId });
      }
      if (!user) return res.status(404).json({ error: "User not found." });

      const dobMatch =
        new Date(user.dob).toISOString().slice(0, 10) === req.body.dob;
      if (!dobMatch) return res.status(401).json({ error: "Invalid credentials." });

      if(user.role==="admin"){
      const otp=Math.floor(100000+Math.random()*900000).toString();
          user.loginOTP=otp;
          user.otpExpiry=new Date( Date.now()+300000);

await user.save();

await sendAdminOTP(

user.email,

otp

);

return res.json({

adminOTP:true,

message:

"Verification code sent to email.",

registrationId:

user.registrationId

});

}

      const token = jwt.sign(
        { id: user._id, registrationId: user.registrationId, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          registrationId: user.registrationId,
          name: user.name,
          role: user.role,
          occupation: user.occupation,
          verified: user.verified,
        },
      });
    } catch {
      res.status(500).json({ error: "Server error." });
    }
  }
);

router.post(

"/verify-admin",

async(req,res)=>{

try{

const{

registrationId,

otp

}=req.body;

const admin=

await Worker.findOne({

registrationId,

role:"admin"

});

if(!admin){

return res
.status(403)
.json({

error:
"You are not admin."

});

}

if(

admin.loginOTP

!==otp

){

return res
.status(401)
.json({

error:
"Invalid verification code."

});

}

if(

Date.now()

>

admin.otpExpiry

){

return res
.status(401)
.json({

error:
"OTP expired."

});

}

const token=

jwt.sign(

{

id:admin._id,

registrationId:
admin.registrationId,

role:"admin"

},

process.env.JWT_SECRET,

{

expiresIn:"7d"

}

);

admin.loginOTP="";

admin.otpExpiry=null;

admin.lastAdminLogin=

new Date();

await admin.save();

res.json({

token,

user:{

registrationId:
admin.registrationId,

name:
admin.name,

role:
admin.role

}

});

}catch{

res
.status(500)
.json({

error:
"Server error."

});

}

});

module.exports = router;
