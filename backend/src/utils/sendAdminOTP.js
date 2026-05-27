const nodemailer=require("nodemailer");

const transporter=
nodemailer.createTransport({

service:"gmail",

auth:{

user:process.env.EMAIL_USER,

pass:process.env.EMAIL_PASS

}

});

const sendAdminOTP=
async(email,otp)=>{

await transporter.sendMail({

from:process.env.EMAIL_USER,

to:email,

subject:
"Seva Website Admin Verification",

html:`

<h2>
Admin Login Verification
</h2>

<p>

Your verification code:

</p>

<h1>

${otp}

</h1>

<p>

Valid for 5 minutes.

</p>

<p>

Do not share this code.

</p>

`

});

};

module.exports=
sendAdminOTP;