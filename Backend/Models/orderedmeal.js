const mongoose = require('mongoose');

const orderedMealSchema = new mongoose.Schema({
  mealName:{
    type: String,
  } ,

  mealId: {
    type:String
},
  price: {
    type:Number
},
  quantity: {
    type:Number
},
  totalPrice: {
    type:Number
},
deliveryOption:{
    type:String
},
deliveryCharge:{
    type:String,
   
},
userId:{
    type:String
},
cusId:{
  type:String
},
status: {
    type: String,
    enum: ["pending","accepted","cancelled","completed","search","finished"],
    default: "pending"
},
accompanimentsName:{
      type: String,      
},
rating: { 
  type: Number,
   default: 0 
  },
}, {timestamps: true}
);

module.exports = mongoose.model('OrderedMeal', orderedMealSchema);
