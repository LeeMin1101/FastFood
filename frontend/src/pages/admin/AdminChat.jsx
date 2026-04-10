import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { SERVER_URL } from "../../config";

const socket = io(SERVER_URL);

export default function AdminChat({ externalActiveClient }) {
  const [clients, setClients] = useState({});
  const [activeClient, setActiveClient] = useState(null);
  const [replyMsg, setReplyMsg] = useState("");

  useEffect(() => {
    if (externalActiveClient) setActiveClient(externalActiveClient);
  }, [externalActiveClient]);

  useEffect(() => {
    socket.emit("admin_join");
    socket.on("admin_load_history", (history) => {
      const grouped = {};
      history.forEach(m => {
        if (!grouped[m.clientId]) grouped[m.clientId] = { name: m.clientName, messages: [] };
        grouped[m.clientId].messages.push(m);
      });
      setClients(grouped);
    });

    socket.on("admin_receive_message", (newMsg) => {
      setClients(prev => {
        const current = prev[newMsg.clientId] || { name: newMsg.clientName, messages: [] };
        return { ...prev, [newMsg.clientId]: { ...current, messages: [...current.messages, newMsg] } };
      });
    });

    return () => { socket.off("admin_load_history"); socket.off("admin_receive_message"); };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!replyMsg.trim() || !activeClient) return;
    const msg = { sender: "admin", text: replyMsg };
    setClients(prev => ({ ...prev, [activeClient]: { ...prev[activeClient], messages: [...prev[activeClient].messages, msg] } }));
    socket.emit("admin_reply_message", { targetClientId: activeClient, clientName: clients[activeClient].name, message: replyMsg });
    setReplyMsg("");
  };

  return (
    <div className="h-[75vh] bg-[#111] border border-white/5 rounded-3xl shadow-2xl flex overflow-hidden">
      {/* Sidebar hội thoại */}
      <div className="w-1/3 border-r border-white/5 flex flex-col bg-[#0d0d0d]">
        <div className="p-6 font-black uppercase text-xs tracking-[0.2em] text-gray-500 border-b border-white/5">Hội thoại</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {Object.keys(clients).map(id => (
            <button key={id} onClick={() => setActiveClient(id)} 
              className={`w-full text-left p-4 rounded-2xl transition-all border ${activeClient === id ? 'bg-orange-500/10 border-orange-500/30' : 'bg-transparent border-transparent hover:bg-white/5'}`}>
              <p className="font-bold text-white">{clients[id].name}</p>
              <p className="text-[11px] text-gray-500 truncate mt-1">{clients[id].messages.slice(-1)[0]?.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cửa sổ chat */}
      <div className="flex-1 flex flex-col bg-transparent">
        {activeClient ? (
          <>
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#151515]">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <div className="font-bold text-white tracking-wide">{clients[activeClient].name}</div>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
              {clients[activeClient].messages.map((m, idx) => (
                <div key={idx} className={`p-4 max-w-[75%] rounded-2xl text-sm leading-relaxed shadow-sm ${m.sender === 'admin' ? 'bg-orange-600 text-white self-end rounded-tr-none' : 'bg-white/5 text-gray-300 border border-white/5 self-start rounded-tl-none'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="p-5 bg-[#0d0d0d] border-t border-white/5 flex gap-3">
              <input value={replyMsg} onChange={e => setReplyMsg(e.target.value)} placeholder="Nhập tin nhắn hỗ trợ..." className="flex-1 bg-[#1a1a1a] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-all text-sm" />
              <button type="submit" className="bg-orange-600 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all">Gửi</button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
            <span className="text-4xl mb-4 opacity-20">💬</span>
            <p className="font-bold uppercase text-[10px] tracking-[0.2em]">Chọn một hội thoại để trả lời</p>
          </div>
        )}
      </div>
    </div>
  );
}