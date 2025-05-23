const mongoose = require("mongoose")
require('dotenv').config()

const port = process.env.MONGOPORT || ""


mongoose.connect(port)
.then(()=>
    console.log("Mongo is running")
)
.catch((err)=>{
    console.log(`Fail to connect:${err}`)
})


