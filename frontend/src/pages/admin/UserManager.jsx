import React, { useState, useEffect } from "react";
import axios from "axios";
import { SERVER_URL } from "../../config";

export default function UserManager({ onInitiateChat }) {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", role: "user", password: "" });

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/auth/users`, getAuthHeader());
      setUsers(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      if (!data.password) delete data.password;
      const res = await axios.put(`${SERVER_URL}/api/auth/users/${editingUser._id}`, data, getAuthHeader());
      setUsers(users.map(u => u._id === editingUser._id ? res.data.user : u));
      setIsModalOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa tài khoản này?")) {
      try {
        await axios.delete(`${SERVER_URL}/api/auth/users/${id}`, getAuthHeader());
        setUsers(users.filter(u => u._id !== id));
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="bg-[#111] border border-white/5 rounded-3xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="p-5 font-bold">Khách Hàng</th>
              <th className="p-5 font-bold">Liên Hệ</th>
              <th className="p-5 font-bold text-center">Vai Trò</th>
              <th className="p-5 font-bold text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-white/5 transition-colors">
                <td className="p-5 flex items-center gap-4">
                  <img 
                    src={u.avatar ? `${SERVER_URL}${u.avatar}` : `https://ui-avatars.com/api/?name=${u.name}&background=f97316&color=fff`} 
                    className="w-10 h-10 rounded-full border border-white/10 shadow-lg" alt=""
                  />
                  <div>
                    <div className="font-bold text-white">{u.name}</div>
                    <div className="text-gray-500 text-xs mt-0.5">@{u.username || "user"}</div>
                  </div>
                </td>
                <td className="p-5">
                  <div className="text-gray-300">{u.email}</div>
                  <div className="text-orange-500/70 text-xs mt-1 font-medium">{u.phone || "N/A"}</div>
                </td>
                <td className="p-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${u.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-5 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => { setEditingUser(u); setFormData({...u, password: ""}); setIsModalOpen(true); }} className="text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">Sửa</button>
                    <button onClick={() => onInitiateChat(u)} className="text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">Chat</button>
                    <button onClick={() => handleDelete(u._id)} className="text-red-500 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
          <div className="bg-[#111] p-8 rounded-3xl w-full max-w-md border border-white/10 relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-gray-500 hover:text-white">✕</button>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">Chỉnh sửa quyền</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Tên hiển thị</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 p-3 rounded-xl text-white outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Vai trò</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 p-3 rounded-xl text-white outline-none">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Mật khẩu mới</label>
                  <input type="password" placeholder="Để trống nếu không đổi" onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 p-3 rounded-xl text-white outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-orange-500 text-white font-black py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all uppercase tracking-widest mt-4">Cập nhật tài khoản</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}