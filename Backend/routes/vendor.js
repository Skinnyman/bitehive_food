const express = require("express")
const Vendor = require("../Models/Vendor")
const User = require("../Models/user")
const router = express.Router();
const Orders = require("../Models/orderedmeal")
const Favorite = require("../Models/favorite")

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
    const{userId,businessName,email,contactPerson,description,phone,delivery,location}= req.body;
    const vendor = await Vendor.create({userId,businessName,email,contactPerson,description,phone,delivery,location});
     await User.findByIdAndUpdate(userId, { hasVendorShop: true });
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
    const completedOrders = orders.filter(o=>o.status === 'completed').length 

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
      potentialEarning
    })

  }catch(err){
    res.json({error:'Failed to fetch data'})
  }
 
})
module.exports = router;