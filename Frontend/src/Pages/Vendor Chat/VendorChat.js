import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa6";
import { serverport } from "../../Static/Variables";
import io from "socket.io-client";
import axios from "axios";

let socket;

const VendorChat = () => {
  const vendorId = localStorage.getItem("id");
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const [originalData, setOriginalData] = useState({});

  // Connect socket and handle incoming messages
  useEffect(() => {
    if (!vendorId) return;

    if (!socket) {
      socket = io(serverport);
    }

    socket.emit("registerUser", vendorId);

    const savedConversations = localStorage.getItem("conversation");
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }

    socket.on("receiveMessage", (data) => {
      const { senderId, username, text,time } = data;

      // Add to conversations if new client
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === senderId);
        if (!exists) {
          const updated = [...prev, { id: senderId, username }];
          localStorage.setItem("conversation", JSON.stringify(updated));
          return updated;
        }
        return prev;
      });

      // If vendor is actively chatting with the client
      if (senderId === activeChat) {
        setMessages((prev) => [...prev, { sender: "client", text ,times:time}]);
      } else {
        // Otherwise show a red notification dot
        setNotifications((prev) => ({ ...prev, [senderId]: true }));
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [vendorId, activeChat]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load all messages from API for the selected chat
  const fetchMessages = (clientId) => {
    fetch(`${serverport}/api/messages/${clientId}/${vendorId}`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((msg) => ({
          ...msg,
          sender: msg.senderId === vendorId ? "vendor" : "client",
        }));
        setMessages(mapped);
      })
      .catch((err) => console.error("Failed to load messages", err));
  };

  // Open selected chat
  const openChat = (clientId) => {
    if (clientId === activeChat) return;
    setActiveChat(clientId);
    setNotifications((prev) => ({ ...prev, [clientId]: false }));
    setMessages([]);
    localStorage.setItem("activeChat", clientId);
    fetchMessages(clientId);
  };

  // Get vendor business name
  useEffect(() => {
    axios
      .get(`${serverport}/api/vendor/business?userId=${vendorId}`)
      .then((res) => {
        const data = res.data;
        setOriginalData(Array.isArray(data) ? data : [data]);
      })
      .catch((err) => console.log(err));
  }, [vendorId]);

  // Send message
  const handleSend = () => {
    let time = (new Date(Date.now()).getHours() % 12 || 12) + ":" + (new Date(Date.now()).getMinutes() < 10 ? "0" : "") + new Date(Date.now()).getMinutes() + (new Date(Date.now()).getHours() >= 12 ? " pm" : " am");
    if (text.trim() && activeChat) {
      // Emit alert for client
      socket.emit("accept", {
        message: `New Message from ${originalData[0]?.businessName || "Vendor"}`,
        cusId: activeChat,
      });

      // Emit message
      socket.emit("sendMessage", {
        senderId: vendorId,
        receiverId: activeChat,
        text,
        time,
      });

      // Update UI immediately
      setMessages((prev) => [...prev, { sender: "vendor", text,time }]);
      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {/* Mobile drawer trigger */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="md:hidden p-3 text-gray-700"
      >
        ☰ Clients
      </button>

      {/* Mobile Sidebar Drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="absolute left-0 top-11 w-64 h-full bg-white shadow-lg p-4 z-50 space-y-3 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Clients</h2>
              <button onClick={() => setIsDrawerOpen(false)}>✕</button>
            </div>
            {conversations.map((client) => (
              <div
                key={client.id}
                onClick={() => {
                  openChat(client.id);
                  setIsDrawerOpen(false);
                }}
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
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row h-[80vh] max-w-5xl mx-auto border rounded-lg shadow-lg bg-white overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-full md:w-1/3 border-r bg-gray-100 p-4 overflow-y-auto">
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
              <div className="flex-grow p-4 space-y-3 bg-gray-50 overflow-y-auto max-h-[60vh]">
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
              <div className="flex items-center border-t sm:p-3 bg-white gap-2 relative top-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  type="text"
                  placeholder="Reply..."
                  className="flex-grow px-3 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={handleSend}
                  className="ml-3 p-2 sm:p-3 text-white bg-blue-600 hover:bg-blue-700 rounded-full transition"
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
    </>
  );
};

export default VendorChat;
