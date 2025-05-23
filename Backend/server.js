const express = require("express");
const cors = require("cors");
const path = require('path')

require("./services/db")

require('dotenv').config();
const authRoutes = require("./routes/auth");
const vendorRoutes = require("./routes/vendor")
const mealRoutes = require("./routes/meal")
const orderRoutes = require('./routes/order')
 

const port = process.env.PORT || 5001

const app = express();

// middleware
app.use(express.json())
app.use(cors())
app.use('/uploads', express.static(path.join(__dirname,'uploads') ))


// routes
app.use("/api/auth",authRoutes)
app.use("/api/vendor",vendorRoutes)
app.use("/api/meal",mealRoutes)
app.use("/api/order",orderRoutes)




app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`)
})