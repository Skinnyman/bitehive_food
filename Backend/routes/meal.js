const express = require("express")
const Meal = require('../Models/meal')
const router = express.Router();
const multer = require("multer");


const storage = multer.diskStorage(({
    destination:(req,file,cb) => cb(null,'uploads/'),
    filename: (req,file,cb) => cb(null,Date.now() + '-' + file.originalname),
}));

const upload = multer({ storage});

// adding product 
router.post('/addmeal', upload.single('image'), async (req, res) => {
    const{userId,name,mealType,price,chargeType,description,accompaniment}= req.body;
    const image = req.file ? req.file.path : '';
    const meal = await Meal.create({userId,name,image,mealType,price,chargeType,description,accompaniment});
    res.status(201).json(meal);  
  });

 // showing product at the product listing according to the vendor 
  router.get('/meal', async (req,res)=> {
    const {userId} = req.query;
    try{
      const meal = await Meal.find({userId});
      if (!meal) return res.status(404).json({ message: 'Meal not found' });
      res.json(meal)
      
    }catch(err){
      res.json({error:'Failed to fetch business data'})
    }
  
   
  })
  // get all meal to the client
  router.get('/allmeal', async (req,res)=> {
    try{
      const meal = await Meal.find();
      if (!meal) return res.status(404).json({ message: 'Meal not found' });
      res.json(meal)
    }catch(err){
      res.json({error:'Failed to fetch business data'})
    }
   
  })

  // deleting meal by the vendor
 router.delete('/deletemeal/:id', async (req,res) => {
    try {
       const meal = await Meal.findByIdAndDelete(req.params.id);
       res.json(meal)
    } catch (err) {
       res.json({error:'Failed to fetch business data'})
    }
 })










module.exports = router;