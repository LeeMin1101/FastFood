import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false); // State tạo hiệu ứng "Đang gõ..."
  const messagesEndRef = useRef(null); // Ref để cuộn xuống cuối

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

    // Lắng nghe lệnh xóa chat từ Admin để làm sạch màn hình khách
    socket.on("server_clear_chat", () => {
      setMessages([]);
    });

    return () => {
      socket.off("load_history");
      socket.off("user_receive_message");
      socket.off("server_clear_chat");
    };
  }, [clientId]);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    // 1. Thêm tin nhắn của User vào giao diện
    const userMsg = { sender: "user", text: inputMsg };
    setMessages((prev) => [...prev, userMsg]);

    // 2. Gửi lên Server
    socket.emit("user_send_message", { 
      clientId, 
      senderName, 
      message: inputMsg 
    });
    
    setInputMsg("");

    // 3. LOGIC TIN NHẮN TỰ ĐỘNG (Chỉ kích hoạt nếu trước đó Admin chưa trả lời)
    const hasAdminReplied = messages.some(m => m.sender === "admin");
    if (!hasAdminReplied && messages.length < 2) {
      setIsTyping(true); // Bật hiệu ứng đang gõ
      
      // Chờ 1.5 giây rồi mới trả lời để tạo cảm giác tự nhiên
      setTimeout(() => {
        setIsTyping(false);
        const autoReplyMsg = { 
          sender: "admin", 
          text: "Chào bạn! Cảm ơn bạn đã liên hệ MTK FastFood 🍔. Trợ lý tư vấn đã nhận được tin nhắn và sẽ phản hồi bạn trong giây lát nhé!" 
        };
        setMessages((prev) => [...prev, autoReplyMsg]);
      }, 1500);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen ? (
        <div className="w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col h-[480px] overflow-hidden animate-fade-in origin-bottom-right">
          
          {/* --- HEADER --- */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-inner">🍔</div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">MTK FastFood</h3>
                <p className="text-[10px] text-red-100 font-medium">Sẵn sàng hỗ trợ</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 w-8 h-8 flex items-center justify-center rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          {/* --- KHUNG TIN NHẮN --- */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
            
            {/* Tin nhắn chào mừng mặc định */}
            {messages.length === 0 && (
              <div className="text-center mt-4 mb-2">
                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full">Hôm nay</span>
                <div className="flex gap-3 mt-6">
                  <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs shrink-0">M</div>
                  <div className="bg-white border border-gray-100 text-gray-700 text-sm p-3 rounded-2xl rounded-tl-none shadow-sm">
                    Xin chào! 👋 Bạn cần MTK FastFood giúp gì ạ?
                  </div>
                </div>
              </div>
            )}

            {/* Render lịch sử tin nhắn */}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                {msg.sender !== "user" && (
                  <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs shrink-0 shadow-sm">M</div>
                )}
                <div className={`p-3 max-w-[75%] text-sm shadow-sm ${
                  msg.sender === "user" 
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl rounded-tr-none" 
                  : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Hiệu ứng Đang gõ (Typing Indicator) */}
            {isTyping && (
              <div className="flex gap-2 justify-start items-center animate-fade-in">
                <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs shrink-0">M</div>
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center h-10">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                </div>
              </div>
            )}
            
            {/* Điểm neo để tự động cuộn */}
            <div ref={messagesEndRef} />
          </div>

          {/* --- FORM GỬI TIN NHẮN --- */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={inputMsg} 
              onChange={(e) => setInputMsg(e.target.value)} 
              placeholder="Nhập tin nhắn..." 
              className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all text-gray-700" 
            />
            <button 
              type="submit" 
              disabled={!inputMsg.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)} 
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white w-16 h-16 rounded-full shadow-xl shadow-red-500/30 flex items-center justify-center hover:scale-110 transition-transform group"
        >
          <svg className="w-8 h-8 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        </button>
      )}
    </div>
  );
}