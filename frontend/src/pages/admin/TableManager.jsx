import React, { useState, useEffect } from "react";
import axios from "axios";
import { SERVER_URL } from "../../config";

export default function TableManager() {
  const [tables, setTables] = useState([]);
  const [bookings, setBookings] = useState([]);

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

  const fetchData = async () => {
    try {
      const [tRes, bRes] = await Promise.all([
        axios.get(`${SERVER_URL}/api/tables`),
        axios.get(`${SERVER_URL}/api/table-orders`, getAuthHeader())
      ]);
      setTables(tRes.data);
      setBookings(bRes.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggleStatus = async (id) => {
    try {
      const res = await axios.put(`${SERVER_URL}/api/tables/${id}/toggle`, {}, getAuthHeader());
      setTables(tables.map(t => t._id === id ? res.data : t));
    } catch (e) { console.error(e); }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await axios.put(`${SERVER_URL}/api/table-orders/${id}/status`, { status }, getAuthHeader());
      setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8">
      {/* Sơ đồ bàn trực quan */}
      <div className="bg-[#111] border border-white/5 rounded-3xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-white font-black uppercase tracking-widest">Sơ đồ bàn (Click để thay đổi trạng thái)</h3>
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500/20 border border-green-500"></div> Trống</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500 border border-red-400"></div> Đang phục vụ</span>
          </div>
        </div>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
          {tables.map(t => (
            <button key={t._id} onClick={() => handleToggleStatus(t._id)}
              className={`aspect-square rounded-2xl font-black text-sm transition-all duration-300 transform hover:scale-110 shadow-lg ${
                t.isBooked ? 'bg-red-500 text-white border border-red-400' : 'bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500/20'
              }`}>
              {t.tableNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách yêu cầu đặt bàn */}
      <div className="bg-[#111] border border-white/5 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h3 className="text-white font-black uppercase tracking-widest text-sm">Danh sách yêu cầu đặt bàn</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-black tracking-[0.1em]">
              <tr>
                <th className="p-5">Khách hàng</th>
                <th className="p-5 text-center">Bàn</th>
                <th className="p-5">Thời gian</th>
                <th className="p-5 text-center">Số người</th>
                <th className="p-5 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-white">{b.name}</div>
                    <div className="text-gray-500 text-xs">{b.phone}</div>
                  </td>
                  <td className="p-5 text-center font-black text-orange-500 text-base">#{b.tableNumber}</td>
                  <td className="p-5">
                    <div className="text-gray-200 font-bold">{b.time}</div>
                    <div className="text-gray-500 text-[10px] uppercase font-bold mt-1">{new Date(b.date).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td className="p-5 text-center text-white font-bold">{b.guests}</td>
                  <td className="p-5 text-center">
                    <select value={b.status} onChange={(e) => updateBookingStatus(b._id, e.target.value)}
                      className={`border border-white/10 px-3 py-1.5 rounded-lg text-xs font-black uppercase outline-none cursor-pointer tracking-wider ${
                        b.status === 'Chờ xác nhận' ? 'bg-yellow-500/10 text-yellow-500' :
                        b.status === 'Đã xác nhận' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                      <option value="Chờ xác nhận">Chờ xác nhận</option>
                      <option value="Đã xác nhận">Đã xác nhận</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}