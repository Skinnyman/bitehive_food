import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa6";
import { serverport } from "../Static/Variables";
import io from "socket.io-client";
import socket from "../Static/Socket";


// const socket = io(serverport);


const Chat = ({ vendorId }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const userId = localStorage.getItem("id");
  const username = localStorage.getItem("username");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit("registerUser", userId);

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, { sender: "vendor", text: data.text,times:data.time }]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [userId]);

  useEffect(() => {
    if (userId && vendorId) {
      fetch(`${serverport}/api/messages/${userId}/${vendorId}`)
        .then((res) => res.json())
        .then((data) => {
          const formattedMessages = data.map((msg) => ({
            time:msg.time,
            text: msg.text,
            sender: msg.senderId === userId ? "client" : "vendor", // map based on ID
          }));
          setMessages(formattedMessages);
        })
        .catch((err) => console.error("Failed to load messages", err));
    }
  }, [userId, vendorId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
   
    let time = (new Date(Date.now()).getHours() % 12 || 12) + ":" + (new Date(Date.now()).getMinutes() < 10 ? "0" : "") + new Date(Date.now()).getMinutes() + (new Date(Date.now()).getHours() >= 12 ? " pm" : " am");

    socket.emit("place_order",{message:`New Message from ${username}`,vendorId:vendorId})
    if (text.trim()) {
      socket.emit("sendMessage", {
        senderId: userId,
        receiverId: vendorId,
        text,
        username,
        time,
      });
      setMessages((prev) => [...prev, { sender: "client", text ,time}]);
      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="max-w-md w-full mx-auto my-4 border rounded-xl shadow-lg flex flex-col h-[70vh] bg-white overflow-hidden">
      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-4 py-2 rounded-xl text-sm break-words ${
              msg.sender === "client"
                ? "ml-auto bg-blue-600 text-white rounded-br-none"
                : "mr-auto bg-gray-300 text-gray-900 rounded-bl-none"
            }`}
          >
            {msg.text}
            <div className="relative  text-right text-white">
                         {msg.time}
             </div>
            <div className="relative  text-left text-white">
                         {msg.times}
             </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input & Button */}
      <div className="flex items-center border-t p-3 bg-white">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="Type a message..."
          className="flex-grow px-3 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSend}
         className="ml-3 p-2 sm:p-3 text-white bg-blue-600 hover:bg-blue-700 rounded-full transition"
          aria-label="Send"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Chat;
