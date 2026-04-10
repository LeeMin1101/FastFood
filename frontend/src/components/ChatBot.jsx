import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { SERVER_URL } from "../config";
// 👉 IMPORT REACT-ICONS
import { FiX, FiSend, FiMessageCircle } from "react-icons/fi";
import { FaHamburger } from "react-icons/fa";

const socket = io(`${SERVER_URL}`);

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  
  const clientId = user ? user.username : "guest_" + (localStorage.getItem("guest_id") || Date.now());
  if (!user && !localStorage.getItem("guest_id")) {
    localStorage.setItem("guest_id", clientId.replace("guest_", ""));
  }
  
  const senderName = user ? user.name : "Khách vãng lai";

  useEffect(() => {
    socket.emit("join_chat", clientId);

    socket.on("load_history", (history) => {
      setMessages(history);
    });

    socket.on("user_receive_message", (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    // Lắng nghe sự kiện bật/tắt hiệu ứng gõ chữ từ backend
    socket.on("bot_typing", (status) => {
      setIsTyping(status);
    });

    socket.on("server_clear_chat", () => {
      setMessages([]);
    });

    return () => {
      socket.off("load_history");
      socket.off("user_receive_message");
      socket.off("bot_typing");
      socket.off("server_clear_chat");
    };
  }, [clientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  const handleOpenChat = () => {
    setIsAnimating(true);
    setIsOpen(true);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    // 1. Thêm tin nhắn của User vào giao diện
    const userMsg = { sender: "user", text: inputMsg };
    setMessages((prev) => [...prev, userMsg]);

    // 2. Gửi lên Server (Server sẽ gọi Gemini)
    socket.emit("user_send_message", { 
      clientId, 
      senderName, 
      message: inputMsg 
    });
    
    setInputMsg("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <style>{`
        @keyframes chatPopup {
          from { opacity: 0; transform: scale(0.7) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes iconPulse {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(0.95) rotate(-5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .animate-chat-open { animation: chatPopup 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-icon-click { animation: iconPulse 0.4s ease-out forwards; }
      `}</style>

      {isOpen ? (
        // LIGHT THEME: bg-white, bóng đổ mạnh để nổi bật trên nền web
        <div className={`w-[350px] bg-white rounded-[2rem] shadow-[0_15px_50px_rgba(0,0,0,0.15)] border border-gray-200 flex flex-col h-[520px] overflow-hidden ${isAnimating ? 'animate-chat-open' : ''}`}>
          
          {/* HEADER */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 px-5 text-white flex justify-between items-center shadow-sm z-10 rounded-t-[2rem]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-xl shadow-md">
                  <FaHamburger className="text-orange-500" />
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="font-black text-base tracking-wide">MTK Support</h3>
                <p className="text-xs text-orange-100 font-medium">Trợ lý ảo thông minh</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 w-9 h-9 flex items-center justify-center rounded-full transition-colors">
              <FiX className="text-2xl" />
            </button>
          </div>
          
          {/* NỘI DUNG CHAT */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-5 custom-scrollbar">
            
            {messages.length === 0 && (
              <div className="text-center mt-2 mb-2">
                <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Hôm nay</span>
                <div className="flex gap-2.5 mt-6 justify-start">
                  <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs shrink-0 font-bold shadow-sm">AI</div>
                  <div className="bg-white border border-gray-200 text-gray-700 text-sm p-3.5 rounded-2xl rounded-tl-none shadow-sm text-left leading-relaxed">
                    Xin chào! 👋 Mình là trợ lý AI của MTK. Bạn cần đặt món, hỏi địa chỉ quán, hay thắc mắc về kiến thức gì mình cũng cân được hết ạ!
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                {msg.sender !== "user" && (
                  <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs shrink-0 shadow-sm font-bold mt-1">AI</div>
                )}
                
                {msg.sender === "user" ? (
                  // Tin nhắn của User
                  <div className="p-3.5 max-w-[80%] text-sm shadow-md bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl rounded-tr-none leading-relaxed">
                    {msg.text}
                  </div>
                ) : (
                  // Tin nhắn của Bot
                  <div className="p-3.5 max-w-[80%] text-sm shadow-sm bg-white border border-gray-200 text-gray-700 rounded-2xl rounded-tl-none text-left leading-relaxed">
                    {msg.text}
                  </div>
                )}
              </div>
            ))}

            {/* Hiệu ứng đang gõ */}
            {isTyping && (
              <div className="flex gap-2.5 justify-start items-center animate-fade-in mt-1">
                <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs shrink-0 font-bold shadow-sm">AI</div>
                <div className="bg-white border border-gray-200 p-3.5 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center h-10">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Ô NHẬP CHAT */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2 rounded-b-[2rem]">
            <input 
              type="text" 
              value={inputMsg} 
              onChange={(e) => setInputMsg(e.target.value)} 
              placeholder="Hỏi AI bất cứ điều gì..." 
              className="flex-1 bg-gray-100 border border-transparent rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500" 
            />
            <button 
              type="submit" 
              disabled={!inputMsg.trim() || isTyping}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-400 text-white w-12 h-[44px] rounded-xl flex items-center justify-center transition-all shadow-md disabled:shadow-none"
            >
              <FiSend className="text-lg -ml-1 mt-0.5" />
            </button>
          </form>
        </div>
      ) : (
        // NÚT MỞ CHAT
        <button 
          onClick={handleOpenChat}
          className={`bg-gradient-to-r from-orange-500 to-red-500 text-white w-16 h-16 rounded-full shadow-[0_10px_25px_rgba(249,115,22,0.4)] flex items-center justify-center hover:scale-110 transition-transform group ${isAnimating ? 'animate-icon-click' : ''}`}
        >
          <FiMessageCircle className="text-3xl group-hover:animate-pulse" />
        </button>
      )}
    </div>
  );
}