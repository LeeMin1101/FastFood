import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { SERVER_URL } from "../config";

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
    // Xóa bỏ logic setTimeout giả ở đây, nhường quyền trả lời cho Backend + Gemini
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
        <div className={`w-[340px] bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex flex-col h-[480px] overflow-hidden ${isAnimating ? 'animate-chat-open' : ''}`}>
          
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white flex justify-between items-center shadow-lg z-10 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-xl shadow-inner">🍔</div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">MTK Support</h3>
                <p className="text-[10px] text-white/80 font-medium">Trợ lý ảo thông minh</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 w-8 h-8 flex items-center justify-center rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-white/5 flex flex-col gap-4">
            
            {messages.length === 0 && (
              <div className="text-center mt-4 mb-2">
                <span className="bg-orange-500/20 text-orange-300 text-xs font-bold px-3 py-1.5 rounded-full border border-orange-500/30">Hôm nay</span>
                <div className="flex gap-3 mt-6">
                  <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs shrink-0">AI</div>
                  <div className="bg-white/10 border border-white/20 text-gray-200 text-sm p-3 rounded-2xl rounded-tl-none shadow-lg text-left">
                    Xin chào! 👋 Mình là trợ lý AI của MTK. Bạn cần đặt món, hỏi địa chỉ quán, hay thắc mắc về kiến thức gì mình cũng cân được hết ạ!
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                {msg.sender !== "user" && (
                  <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs shrink-0 shadow-md">AI</div>
                )}
                <div className={`p-3 max-w-[85%] text-sm shadow-lg ${
                  msg.sender === "user" 
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl rounded-tr-none" 
                  : "bg-white/10 border border-white/20 text-gray-200 rounded-2xl rounded-tl-none text-left"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start items-center animate-fade-in">
                <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs shrink-0">AI</div>
                <div className="bg-white/10 border border-white/20 p-3 rounded-2xl rounded-tl-none shadow-lg flex gap-1.5 items-center h-10">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-3 bg-white/5 border-t border-white/10 flex gap-2 rounded-b-2xl">
            <input 
              type="text" 
              value={inputMsg} 
              onChange={(e) => setInputMsg(e.target.value)} 
              placeholder="Hỏi AI bất cứ điều gì..." 
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-white placeholder-gray-400" 
            />
            <button 
              type="submit" 
              disabled={!inputMsg.trim() || isTyping}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg"
            >
              <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </form>
        </div>
      ) : (
        <button 
          onClick={handleOpenChat}
          className={`bg-gradient-to-r from-orange-500 to-red-500 text-white w-16 h-16 rounded-full shadow-xl shadow-red-500/30 flex items-center justify-center hover:scale-110 transition-transform group ${isAnimating ? 'animate-icon-click' : ''}`}
        >
          <svg className="w-8 h-8 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        </button>
      )}
    </div>
  );
}