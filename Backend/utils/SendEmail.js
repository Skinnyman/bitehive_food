const nodemailer = require('nodemailer');

require('dotenv').config();

exports.sendOTPEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}. It will expire in 2 minutes.`
  };

  
  await transporter.sendMail(mailOptions);
};

