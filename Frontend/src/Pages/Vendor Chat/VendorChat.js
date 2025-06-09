import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa6";
import { serverport } from "../../Static/Variables";
import io from "socket.io-client";

const socket = io(serverport);

const VendorChat = () => {
  const vendorId = localStorage.getItem("id");
  const [conversations, setConversations] = useState([]); // [{id, username}]
  const [activeChat, setActiveChat] = useState(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit("registerUser", vendorId);

    socket.on("receiveMessage", (data) => {
      const { senderId, username, text } = data;

      setNotifications((prev) => ({ ...prev, [senderId]: true }));

      if (!conversations.some((c) => c.id === senderId)) {
        setConversations((prev) => [...prev, { id: senderId, username }]);
      }

      if (activeChat === senderId) {
        setMessages((prev) => [...prev, { sender: "client", text }]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [vendorId, activeChat, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openChat = (clientId) => {
    setActiveChat(clientId);
    setNotifications((prev) => ({ ...prev, [clientId]: false }));
    setMessages([]); // clear current messages

    fetch(`${serverport}/api/messages/${clientId}/${vendorId}`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error("Failed to load messages", err));
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex flex-col md:flex-row h-[80vh] max-w-5xl mx-auto border rounded-lg shadow-lg bg-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 border-r bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Clients</h2>
        {conversations.map((client) => (
          <div
            key={client.id}
            onClick={() => openChat(client.id)}
            className={`flex items-center justify-between cursor-pointer px-4 py-2 rounded hover:bg-gray-200 transition ${
              activeChat === client.id ? "bg-blue-100" : ""
            }`}
          >
            <span>👤 {client.username}</span>
            {notifications[client.id] && (
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            )}
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="w-full md:w-2/3 flex flex-col">
        {activeChat ? (
          <>
            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] px-4 py-2 rounded-xl text-sm break-words ${
                    msg.sender === "vendor"
                      ? "ml-auto bg-blue-600 text-white rounded-br-none"
                      : "mr-auto bg-gray-300 text-gray-900 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center border-t p-3 bg-white">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                type="text"
                placeholder="Reply..."
                className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleSend}
                className="ml-3 p-3 text-white bg-blue-600 hover:bg-blue-700 rounded-full transition"
                aria-label="Send"
              >
                <FaPaperPlane />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-grow text-gray-500">
            <p>Select a client to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorChat;
