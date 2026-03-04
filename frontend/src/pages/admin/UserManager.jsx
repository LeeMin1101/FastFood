import React, { useState, useEffect } from "react";
import axios from "axios";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const API_URL = "http://localhost:3000/api/auth/users";

  // Lấy Header chứa Token từ LocalStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL, getAuthHeader());
      setUsers(response.data);
    } catch (error) {
      console.error("Lỗi tải người dùng:", error.response?.data?.message || "Lỗi server");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        await axios.delete(`${API_URL}/${id}`, getAuthHeader());
        setUsers(users.filter(u => u._id !== id));
      } catch (error) {
        alert(error.response?.data?.message || "Không có quyền thực hiện thao tác này");
      }
    }
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span>👥</span> Quản Lý Tài Khoản Người Dùng
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-bold text-gray-600 uppercase text-xs">Tên</th>
              <th className="p-4 font-bold text-gray-600 uppercase text-xs">Email/Username</th>
              <th className="p-4 font-bold text-gray-600 uppercase text-xs">Vai trò</th>
              <th className="p-4 font-bold text-gray-600 uppercase text-xs">Ngày tạo</th>
              <th className="p-4 font-bold text-gray-600 uppercase text-xs text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-gray-400 italic">Không tìm thấy người dùng nào trong Database</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                  <td className="p-4 font-semibold text-gray-800">{user.name}</td>
                  <td className="p-4 text-gray-600">{user.username || user.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                      user.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400 font-mono">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-4 text-center">
                    {user.role !== 'admin' ? (
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="text-red-400 hover:text-red-600 transition font-bold text-sm"
                      >
                        Xóa
                      </button>
                    ) : (
                      <span className="text-gray-300 text-xs italic">Hệ thống</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}