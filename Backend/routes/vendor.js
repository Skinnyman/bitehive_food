const express = require("express")
const Vendor = require("../Models/Vendor")
const User = require("../Models/user")
const router = express.Router();
const Orders = require("../Models/orderedmeal")
const Favorite = require("../Models/favorite")
const axios = require("axios");

require("dotenv").config();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
// Register Vendor shop
// router.post("/register",async (req,res)=>{
//     const{userId,businessName,email,contactPerson,description,phone,delivery}= req.body;
//     try {
//         const vendor = await Vendor.create({userId,businessName,email,contactPerson,description,phone,delivery});
//         await vendor.save();
//         res.status(201).json(vendor);
        
        
//         const existing = await Vendor.findOne({userId});
//         if (existing) 
//             return res.status(400).json({message:"vendor shop already registered"}) 
//         //update user to mark vendor shop registered
//         await User.findByIdAndUpdate(userId,{hasVendorShop:true})

//     } catch (err){
//         res.status(500).json({message: err.message})
//         console.log(err)
//     }

// })
router.post('/register', async (req, res) => {
    const{userId,businessName,email,contactPerson,network,description,phone,delivery,location}= req.body;
    const vendor = await Vendor.create({userId,businessName,email,contactPerson,description,phone,delivery,location,network});
     await User.findByIdAndUpdate(userId, { hasVendorShop: true });
     
     const response = await axios.post( "https://api.paystack.co/subaccount",{
      business_name: contactPerson,
      settlement_bank:vendor.network,
      account_number: vendor.phone,
      percentage_charge:0,
      description:"Vendor subaccount for split payment",
      primary_contact_email: email,
     },
     {
       headers:{
         Authorization: `Bearer ${PAYSTACK_SECRET}`,
         "Content-Type": "application/json",
        },
      }
    )
    const subaccountCode = response.data.data.subaccount_code;
    vendor.subaccountCode = subaccountCode;
    await vendor.save();

    res.status(201).json(vendor);
   
  });

router.put('/update-business', async (req, res) => {
  const { userId, businessName, contactPerson, phone, email, description, delivery, location } = req.body;
  try {
    const updated = await Vendor.findOneAndUpdate(
      { userId },
      { businessName, contactPerson, phone, email, description, delivery, location },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update business info' });
  }
});

router.get("/vendorinfo",async(req,res)=>{
  const {userId} = req.query;
  try{
    const info = await Vendor.find({userId});
    if (!info) return res.status(404).json({ message: 'Vendor not found' });
    res.json(info)
  }catch(err){
    res.json({error:'Failed to fetch business data'})
  }
})

router.post('/favorite', async (req, res) => {
    const{customerId,vendorId}= req.body;
    const favorite = await Favorite.create({customerId,vendorId});
    res.status(201).json(favorite);
   
  });
router.get('/getfavorite', async (req, res) => {
  const {vendorId} = req.query
  try{
    const favorite = await Favorite.find({vendorId}) 
    const numFav = favorite.length;
    res.status(201).json(numFav);
    
  } catch(err){
    res.json({error:'Failed to fetch data'})
  }
  });

router.post('/unfavorite', async (req, res) => {
    const { customerId, vendorId } = req.body;
    await Favorite.findOneAndDelete({ customerId, vendorId });
    res.json({ message: 'Unfavorited' });
  }); 

 router.get('/is-favorite', async (req,res)=>{
  const {customerId,vendorId} = req.query
  try{
    const fav = await Favorite.findOne({customerId,vendorId})
    res.json({isFav: !!fav});

  }catch(err){
    res.json({error:'Failed to fetch data'})
  }
 }) 

 
router.get('/business', async (req,res)=> {
  const {userId} = req.query;
  try{
    const business = await Vendor.findOne({userId});
    if (!business) return res.status(404).json({ message: 'Vendor not found' });
    res.json(business)
  }catch(err){
    res.json({error:'Failed to fetch business data'})
  }
 
})
router.get('/location', async (req,res)=> {
  const {userId} = req.query;
  try{
    const business = await Vendor.find({userId});
    if (!business) return res.status(404).json({ message: 'Vendor not found' });
    res.json(business)
  }catch(err){
    res.json({error:'Failed to fetch business data'})
  }
 
})

router.get('/allbusiness', async (req,res)=> {
  
  try{
    const business = await Vendor.find();
    if (!business) return res.status(404).json({ message: 'Vendor not found' });
    res.json(business)
  }catch(err){
    res.json({error:'Failed to fetch business data'})
  }
 
})

router.get('/orderinfo', async (req,res)=> {
  const {userId} = req.query;
  try{
    const orders = await Orders.find({userId});

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const cancelledOrders = orders.filter(o =>o.status==='cancelled').length
    const completedOrders = orders.filter(o=>o.status === 'pay').length 
    const finishedOrders = orders.filter(o=>o.status === 'finished').length 
    console.log(completedOrders)

    const totalEarning = orders
    .filter(o => o.status === 'completed')
    .reduce((sum,o)=> sum + o.totalPrice,0)

    const potentialEarning = orders
    .filter(o => o.status === 'pending' || o.status === 'accepted')
    .reduce((sum,o)=> sum + o.totalPrice,0)

    res.json({
      totalOrders,
      pendingOrders,
      cancelledOrders,
      completedOrders,
      totalEarning,
      finishedOrders,
      potentialEarning
    })

  }catch(err){
    res.json({error:'Failed to fetch data'})
  }
 
})
module.exports = router;