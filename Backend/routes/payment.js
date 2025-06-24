const express = require('express');
const axios = require('axios');
const Vendor = require('../Models/Vendor');
const router = express.Router();
require('dotenv').config();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY; 
const frontPort = process.env.FRONTEND

// Initialize Paystack Mobile Money payment
router.post('/initialize-payment', async (req, res) => {
  const { userId, amount, email, orderId } = req.body;
//   console.log(req.body)
  try {
    const vendor = await Vendor.findOne({userId: userId});
    // console.log(vendor.phone)
 
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100,
        channels: ['mobile_money'], // only show MoMo
        callback_url: (`${frontPort}/client`),
        metadata: {
          custom_fields: [
            {
              display_name: 'Vendor MoMo Number',
              variable_name: 'vendor_momo',
              value: vendor.phone,
            },
            {
              display_name: 'Order ID',
              variable_name: 'order_id',
              value: orderId,
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(paystackRes.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Optional: Verify payment
router.get('/verify/:reference', async (req, res) => {
  const { reference } = req.params;


  try {
    const verifyRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    });

    res.json(verifyRes.data);
  
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
