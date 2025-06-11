// src/context/SocketContext.js
import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { serverport } from "../Static/Variables";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ userId, children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io(serverport, {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      newSocket.emit("registerUser", userId);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
