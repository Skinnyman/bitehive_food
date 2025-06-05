const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/user");

require("dotenv").config();

// register
router.post("/register", async (req, res) => {
    const { username, email, password, confirmPassword, role } = req.body;
  
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }
  
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ msg: "Email already exists" });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role });
  
    await user.save();
  
    res.json({
      msg: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        hasShop: user.hasShop || false, // assuming you have this field, default to false
      },
    });
  });
  
// login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role,username: user.username,hasVendorShop:user.hasVendorShop }, process.env.JWT, { expiresIn: "1h" });
    res.json({ token, role: user.role,username: user.username,hasShop: user.hasVendorShop,id: user._id });
   
});

module.exports = router;