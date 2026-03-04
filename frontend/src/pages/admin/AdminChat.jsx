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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar: Danh sách khách hàng */}
      <div className="w-1/4 bg-white border-r">
        <h2 className="p-4 font-bold border-b">Khách hàng trực tuyến</h2>
        {chats.map(chat => (
          <div 
            key={chat.id} 
            onClick={() => setSelectedChat(chat.id)}
            className={`p-4 cursor-pointer hover:bg-orange-50 ${selectedChat === chat.id ? 'bg-orange-100' : ''}`}
          >
            Chat ID: {chat.id}
          </div>
        ))}
      </div>

      {/* Nội dung chat */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className={`mb-2 ${m.sender === "staff" ? "text-right" : "text-left"}`}>
                  <span className={`inline-block p-2 rounded-lg ${m.sender === "staff" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                    {m.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-white flex gap-2">
              <input 
                value={reply} 
                onChange={(e) => setReply(e.target.value)}
                className="flex-1 border p-2 rounded" 
                placeholder="Nhập câu trả lời..."
              />
              <button onClick={sendReply} className="bg-orange-500 text-white px-4 py-2 rounded">Gửi</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Chọn một khách hàng để bắt đầu hỗ trợ</div>
        )}
      </div>
    </div>
  );
}