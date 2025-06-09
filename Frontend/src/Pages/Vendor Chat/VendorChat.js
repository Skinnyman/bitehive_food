import React, { useState, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa6";
import { serverport } from "../../Static/Variables";
import io from "socket.io-client";

const socket = io(serverport)

const VendorChat = () => {
    const vendorId = localStorage.getItem("id")
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState({});

  useEffect(() => {
    console.log(vendorId)
    socket.emit("registerUser", vendorId);

    socket.on("receiveMessage", (data) => {
      const senderId = data.senderId;
      setNotifications((prev) => ({ ...prev, [senderId]: true }));
      if (!conversations.includes(senderId)) {
        setConversations((prev) => [...prev, senderId]);
      }
      if (activeChat === senderId) {
        setMessages((prev) => [...prev, { sender: "client", text: data.text }]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [vendorId, activeChat]);

  const openChat = (clientId) => {
    setActiveChat(clientId);
    setNotifications((prev) => ({ ...prev, [clientId]: false }));
    setMessages([]);
  };

  const handleSend = () => {
    if (text.trim()) {
      socket.emit("sendMessage", {
        senderId: vendorId,
        receiverId: activeChat,
        text,
      });
      setMessages((prev) => [...prev, { sender: "vendor", text }]);
      setText("");
    }
  };

  return (
    <div className="vendor-chat-panel">
      <div className="sidebar">
        {conversations.map((clientId) => (
          <div key={clientId} onClick={() => openChat(clientId)}>
            👤 {clientId} {notifications[clientId] && <span className="notify-dot" />}
          </div>
        ))}
      </div>
      <div className="chat-window">
        {activeChat && (
          <>
            <div className="messages">
              {messages.map((msg, i) => (
                <div key={i} className={msg.sender === "vendor" ? "msg-right" : "msg-left"}>
                  {msg.text}
                </div>
              ))}
            </div>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply..." />
            <button onClick={handleSend}><FaPaperPlane /></button>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorChat;
