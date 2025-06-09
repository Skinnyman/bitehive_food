const express = require("express");
const cors = require("cors");
const path = require('path');
const http = require("http");
const {Server} = require("socket.io");
const Message = require("./Models/message");


require("./services/db");

require('dotenv').config();
const authRoutes = require("./routes/auth");
const vendorRoutes = require("./routes/vendor")
const mealRoutes = require("./routes/meal")
const orderRoutes = require('./routes/order')
const messageRoutes = require("./routes/message");
 

const port = process.env.PORT || 5001
const frontPort = process.env.FRONTEND

const app = express();
const server = http.createServer(app);


// middleware
app.use(express.json());
app.use(cors());

const io = new Server(server,{
    cors:{
        origin:{frontPort},
        methods:["GET","POST"],
    },
});
let vendorSockets = {};
let customerSockets = {};
let onlineUsers = {};

io.on("connection",(socket) => {
   //console.log(`User connected:${socket.id}`)
//    socket.on("send_message",(data)=>{
//     socket.broadcast.emit("receive_message",data)
//    })
  // register vendors with a socket Id
   socket.on('registerVendor', (vendorId) => {
    vendorSockets[vendorId] = socket.id;
    //console.log(`Vendor ${vendorId} registered with socket ${socket.id}`);
  });

  // register vendors with socketId
  socket.on("registrationcustomer",(userId)=>{
     customerSockets[userId] = socket.id;
     //console.log(`customer ${userId} registered with socket ${socket.id}`);
  })
  // Register user
  socket.on("registerUser", (userId) => {
   
    onlineUsers[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });
  // Handle message sending
  socket.on("sendMessage",async ({ senderId, receiverId, text,username }) => {
    // save to database
    const newMessage = new Message({ senderId, receiverId, text,username });
    await newMessage.save();
    
    const receiverSocketId = onlineUsers[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", { senderId, text,username });
      io.to(receiverSocketId).emit("newMessageNotification", { from: senderId });
    }
  });
// message to customer when the vendor clicks accept order
  socket.on("accept",(data)=>{
    //console.log("This is the message",data.message)
    const userId = data.cusId
    //console.log(userId)

    // notify the customer 
    const customerSocketId = customerSockets[userId];
    if (customerSocketId){
      io.to(customerSocketId).emit("accept",data)
    }
  })

  // message is from the user to the vendor when the user clicks order
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
  }
);
  socket.on('disconnect', () => {
    for (const userId in customerSockets) {
      if (customerSockets[userId] === socket.id) {
        delete customerSockets[userId];
        break;
      }
    }
  }
);
socket.on("disconnect", () => {
  for (let userId in onlineUsers) {
    if (onlineUsers[userId] === socket.id) {
      delete onlineUsers[userId];
      console.log(`User ${userId} disconnected`);
      break;
    }
  }
});



})




app.use('/uploads', express.static(path.join(__dirname,'uploads') ))


// routes
app.use("/api/auth",authRoutes);
app.use("/api/vendor",vendorRoutes);
app.use("/api/meal",mealRoutes);
app.use("/api/order",orderRoutes);
app.use("/api/messages", messageRoutes);




server.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`)
})
