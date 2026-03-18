import React, { useState, useEffect } from "react";
import { db } from "./firebase-config"; // File cấu hình firebase của bạn
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from "firebase/firestore";

export default function AdminChat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]); // Danh sách các cuộc hội thoại
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");

  // 1. Lấy danh sách các khách hàng đang chat
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "chats"), (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 2. Lấy tin nhắn khi chọn một khách hàng
  useEffect(() => {
    if (!selectedChat) return;
    const q = query(collection(db, "chats", selectedChat, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, [selectedChat]);

  const sendReply = async () => {
    await addDoc(collection(db, "chats", selectedChat, "messages"), {
      text: reply,
      sender: "staff",
      createdAt: serverTimestamp(),
    });
    setReply("");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900">
      {/* Sidebar: Danh sách khách hàng */}
      <div className="w-1/4 bg-white/5 backdrop-blur-xl border-r border-white/10">
        <h2 className="p-4 font-bold border-b border-white/10 text-white">Khách hàng trực tuyến</h2>
        {chats.map(chat => (
          <div 
            key={chat.id} 
            onClick={() => setSelectedChat(chat.id)}
            className={`p-4 cursor-pointer hover:bg-white/10 transition-colors border-b border-white/5 text-white ${selectedChat === chat.id ? 'bg-orange-500/20 border-l-2 border-l-orange-500' : ''}`}
          >
            Chat ID: {chat.id}
          </div>
        ))}
      </div>

      {/* Nội dung chat */}
      <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl">
        {selectedChat ? (
          <>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === "staff" ? "justify-end" : "justify-start"}`}>
                  <span className={`inline-block px-4 py-3 rounded-2xl max-w-xs ${m.sender === "staff" ? "bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-tr-none" : "bg-white/10 text-gray-200 border border-white/20 rounded-tl-none"}`}>
                    {m.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
              <input 
                value={reply} 
                onChange={(e) => setReply(e.target.value)}
                className="flex-1 border border-white/20 bg-white/5 p-3 rounded-xl text-white placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white/10 transition-all" 
                placeholder="Nhập câu trả lời..."
              />
              <button onClick={sendReply} className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all shadow-lg">Gửi</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 font-medium text-lg">
            <div className="text-center">
              <span className="text-6xl mb-4 block opacity-30">💬</span>
              Chọn một khách hàng để bắt đầu hỗ trợ
            </div>
          </div>
        )}
      </div>
    </div>
  );
}