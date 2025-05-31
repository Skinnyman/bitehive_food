const mongoose = require( "mongoose");

const deliverySchema = new mongoose.Schema(
    {
     userId:{
        type:String,
     }  , 
     orderId:{
       type:String,
     },
    Deliveryman: {
            type: String,
        },
    Deliveryphone: {
        type: String,
    },
    contact_person_phone: {
        type: String,
    
    },
    clientName:{
       type:String,
       
    },
    location: {
		latitude: String,
		longitude: String,
		address: String, 
	  } 
}

)
module.exports = mongoose.model("delivery",deliverySchema)