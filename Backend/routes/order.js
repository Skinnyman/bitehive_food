const express = require("express")
const Order = require("../Models/order")
const orderedMeal = require("../Models/orderedmeal");

const router = express.Router();
// Storing all orders in the database
router.post("/ordered",async(req,res) =>{
 const{mealName,mealId, price,quantity,deliveryOption,totalPrice,userId,cusId}= req.body;
 const ordered = await orderedMeal.create({mealName,mealId, price,quantity,deliveryOption,totalPrice,userId,cusId});
    res.status(201).json(ordered);    

})


// Getting all orders 
router.get("/all", async (req, res) => {
  const {cusId} = req.query;
    try {
      const orders = await orderedMeal.find({cusId});
      res.json(orders); 
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" }); 
    }
  });
  
 //get order by userId(vendor) 
router.get('/getorder', async (req,res)=> {
  const {userId} = req.query;
  try{
    const ordered = await orderedMeal.find({userId});
    if (!ordered) return res.status(404).json({ message: 'Vendor not found' });
    res.json(ordered)
   
  }catch(err){
    res.json({error:'Failed to fetch business data'})
  }
 
 
})  

// changing status
router.patch("/status/:id", async(req,res)=>{
    try{
        const {status} = req.body;
        const updated = await orderedMeal.findByIdAndUpdate(
            req.params.id, 
            {status},
            {new:true}
        );
        res.json(updated)

    } catch (err) {
        res.json({message:"Error updating order status"});
    }
})
router.get('/rating',async(req,res)=> {
  const { userId } = req.query;

  try {
    const meals = await orderedMeal.find({ userId, rating: { $exists: true } });

    const ratingsCount = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4-5": 0
    };

    let totalRating = 0;

    meals.forEach((meal) => {
      const rating = meal.rating;
      totalRating += rating;
      if (rating >= 4) {
        ratingsCount["4-5"]++;
      } else if (rating === 3) {
        ratingsCount["3"] = (ratingsCount["3"] || 0) + 1;
      } else if (rating === 2) {
        ratingsCount["2"] = (ratingsCount["2"] || 0) + 1;
      } else if (rating === 1) {
        ratingsCount["1"] = (ratingsCount["1"] || 0) + 1;
      }
     
    });

    const average = meals.length > 0 ? (totalRating / meals.length).toFixed(1) : 0;

    res.json({
      ratingSummary: ratingsCount,
      averageRating: parseFloat(average)
    });
    

  }catch(err){
    res.json({message:"Error getting rating"});
  }
})

// changing rating
router.patch("/rate/:id", async (req, res) => {
  try {
    const { rating } = req.body;
    const updated = await orderedMeal.findByIdAndUpdate(
      req.params.id,
      { rating },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating rating" });
  }
});


router.get('/orders-stats', async (req, res) => {
  const { userId } = req.query;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  try {
    const dailyOrders = await orderedMeal.countDocuments({
      userId,
      createdAt: { $gte: startOfDay }
    });

    const weeklyOrders = await orderedMeal.countDocuments({
      userId,
      createdAt: { $gte: startOfWeek }
    });

    res.json({ dailyOrders, weeklyOrders });
    //console.log("This is daily",dailyOrders,"This is weekly orders:",weeklyOrders)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order stats' });
  }
});


module.exports = router;