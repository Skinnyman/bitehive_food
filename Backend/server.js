const express = require("express");
const cors = require("cors");
const path = require('path');
const http = require("http")
const {Server} = require("socket.io")



require("./services/db")

require('dotenv').config();
const authRoutes = require("./routes/auth");
const vendorRoutes = require("./routes/vendor")
const mealRoutes = require("./routes/meal")
const orderRoutes = require('./routes/order')
 

const port = process.env.PORT || 5001

const app = express();
const server = http.createServer(app);


// middleware
app.use(express.json());
app.use(cors());

const io = new Server(server,{
    cors:{
        origin:'http://localhost:3000',
        methods:["GET","POST"],
    },
});
let vendorSockets = {};

io.on("connection",(socket) => {
   //console.log(`User connected:${socket.id}`)
//    socket.on("send_message",(data)=>{
//     socket.broadcast.emit("receive_message",data)
//    })

   socket.on('registerVendor', (vendorId) => {
    vendorSockets[vendorId] = socket.id;
    console.log(`Vendor ${vendorId} registered with socket ${socket.id}`);
  });
  socket.on("place_order",(data)=>{
    //console.log("This is the message",data.message)
    const vendorId = data.vendorId;
    //console.log(vendorId )

    // Notify the vendor in real time
    const vendorSocketId = vendorSockets[vendorId];
    if (vendorSocketId) {
      io.to(vendorSocketId).emit('newOrder', data);
    }
  })
  socket.on('disconnect', () => {
    for (const vendorId in vendorSockets) {
      if (vendorSockets[vendorId] === socket.id) {
        delete vendorSockets[vendorId];
        break;
      }
    }
  });

})




app.use('/uploads', express.static(path.join(__dirname,'uploads') ))


// routes
app.use("/api/auth",authRoutes)
app.use("/api/vendor",vendorRoutes)
app.use("/api/meal",mealRoutes)
app.use("/api/order",orderRoutes)




server.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`)
})
