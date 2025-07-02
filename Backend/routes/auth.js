const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/user");
const OPT = require("../Models/Otp");
const {sendOTPEmail} = require("../utils/SendEmail");

require("dotenv").config();
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
// const opt = generateOTP()
// const random = 100000 + Math.random() * 900000
// console.log(opt,random)
// const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
// console.log(expiresAt)

// register
router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword, role } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords do not match" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ msg: "Email already exists" });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
  await OPT.create({ email, otp, expiresAt });
  await sendOTPEmail(email, otp);

  // Store password temporarily in frontend
  res.json({
    msg: "OTP sent",
    email,
    tempUser: { username, email, password, role }
  });
});

// verify the signup using the opt code
router.post("/verify-signup-otp", async (req, res) => {
  const { email, otp, username, password, role } = req.body;

  const otpRecord = await OPT.findOne({ email, otp });
  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    return res.status(400).json({ msg: "Invalid or expired OTP" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword, role });
  await newUser.save();
  await OPT.deleteMany({ email });

  const token = jwt.sign(
    { id: newUser._id, role, username: newUser.username, email, hasVendorShop: false },
    process.env.JWT,
    { expiresIn: "1h" }
  );

  res.json({
    msg: "User registered successfully",
    token,
    user: {
      id: newUser._id,
      username: newUser.username,
      role: newUser.role,
      hasShop: false,
    }
  });
});

  
// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
  await OPT.create({ email, otp, expiresAt });
  await sendOTPEmail(email, otp);

  res.json({ msg: "OTP sent", email });
});

router.post("/verify-login-otp", async (req, res) => {
  const { email, otp } = req.body;

  const otpRecord = await OPT.findOne({ email, otp });
  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  await OPT.deleteMany({ email });

  const token = jwt.sign(
    { id: user._id, role: user.role, username: user.username, email, hasVendorShop: user.hasVendorShop },
    process.env.JWT,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login successful",
    token,
    username: user.username,
    email: user.email,
    role: user.role,
    id: user._id,
    hasShop: user.hasVendorShop || false,
  });
});

// Resend OPT to the user's email
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
  await OPT.create({ email, otp, expiresAt });
  await sendOTPEmail(email, otp);
  res.json({ message: 'OTP resent' });
});


module.exports = router;