const express = require('express');
const axios = require('axios');
const Vendor = require('../Models/Vendor');
const Order = require("../Models/orderedmeal")
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
        channels: ['mobile_money'], 
        callback_url: (`${frontPort}/client`),
        subaccount: vendor.subaccountCode,
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

//To verify the payment
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

// router.get('/verify/:reference', async (req, res) => {
//     const { reference } = req.params;
  
//     try {
//       const verifyRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET}`,
//         },
//       });
  
//       const data = verifyRes.data.data;
  
//       if (data.status === "success") {
//         const orderId = data.metadata?.custom_fields?.find(f => f.variable_name === "order_id")?.value;
//         // ✅ Mark order as paid
//       await Order.findByIdAndUpdate(orderId, { status: "pay" });
// V
//         const order = await Order.findById(orderId);
  
//         const vendor = await Vendor.findOne({userId: userId});
  
//         // Register vendor as transfer recipient if not already
//         if (!vendor.recipientCode) {
//           const createRecipient = await axios.post(
//             "https://api.paystack.co/transferrecipient",
//             {
//               type: "mobile_money",
//               name: vendor.contactPerson,
//               account_number: vendor.phone,
//               bank_code: vendor.network, 
//               currency: "GHS",
//             },
//             {
//               headers: {
//                 Authorization: `Bearer ${PAYSTACK_SECRET}`,
//                 'Content-Type': 'application/json',
//               },
//             }
//           );
  
//           vendor.recipientCode = createRecipient.data.data.recipient_code;
//           await vendor.save();
//         }
  
//         //  Send MoMo to vendor
//         await axios.post(
//           "https://api.paystack.co/transfer",
//           {
//             source: "balance",
//             amount: order.totalPrice * 100,
//             recipient: vendor.recipientCode,
//             reason: `Payment for Order ${orderId}`,
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${PAYSTACK_SECRET}`,
//               'Content-Type': 'application/json',
//             },
//           }
//         );
  
//         return res.json({ message: "Payment verified and MoMo sent to vendor" });
//       }
  
//       res.status(400).json({ error: "Payment not successful" });
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//       res.status(500).json({ error: err.message });
//     }
//   });
  
module.exports = router;
