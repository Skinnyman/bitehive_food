import React, { useState, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa6";
import { serverport } from "../Static/Variables";
import io from "socket.io-client";

const socket = io(serverport)

const Chat = ({  vendorId }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(false);
  const userId = localStorage.getItem("id");

  useEffect(() => {
    socket.emit("registerUser", userId);
    console.log(vendorId,userId)

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, { sender: "vendor", text: data.text }]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [userId]);

  const handleSend = () => {
    if (text.trim()) {
      socket.emit("sendMessage", {
        senderId: userId,
        receiverId: vendorId,
        text,
      });
      setMessages((prev) => [...prev, { sender: "client", text }]);
      setText("");
    }
  };

  return (
    <div>
      <button onClick={() => setVisible(!visible)}>💬 Chat</button>
      {visible && (
        <div className="chat-popup">
          <div className="messages">
            {messages.map((msg, i) => (
              <div key={i} className={msg.sender === "client" ? "msg-right" : "msg-left"}>
                {msg.text}
              </div>
            ))}
          </div>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type..." />
          <button onClick={handleSend}><FaPaperPlane /></button>
        </div>
      )}
    </div>
  );
};

export default Chat;
