const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
   
    username: {
        type: String,
         require:true
    },
    email: {
        type: String,
        require:true
    },
    password: {
        type: String,
        require:true
    },
    role: {
        type: String,
        require:true,
        enum:["customer","vendor"]
    },
    hasVendorShop:{
         type:Boolean,
         default: false

    },
    
})

module.exports = mongoose.model("User",userSchema)