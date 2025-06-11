// src/socket.js
import { io } from "socket.io-client";
import { serverport } from "./Variables";

const socket = io(serverport, {
  autoConnect: true, // or false if you want to control manually
  transports: ['websocket'], // optional but helps stability
});

export default socket;
