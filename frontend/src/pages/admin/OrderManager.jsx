import React, { useState, useEffect } from "react";
import axios from "axios";
import { SERVER_URL } from "../../config";

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/api/orders`, getAuthHeader());
        setOrders(res.data);
      } catch (e) { console.error(e); }
    };
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`${SERVER_URL}/api/orders/${id}/status`, { status }, getAuthHeader());
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa đơn hàng này?")) {
      try {
        await axios.delete(`${SERVER_URL}/api/orders/${id}`, getAuthHeader());
        setOrders(orders.filter(o => o._id !== id));
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="bg-[#111] border border-white/5 rounded-3xl shadow-xl overflow-hidden w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="p-5 font-bold">Mã Đơn</th>
              <th className="p-5 font-bold">Khách Hàng</th>
              <th className="p-5 font-bold">Món Đặt</th>
              <th className="p-5 font-bold text-center">Trạng Thái</th>
              <th className="p-5 font-bold text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((o) => (
              <tr key={o._id} className="hover:bg-white/5 transition-colors">
                <td className="p-5 font-bold text-white">#{o._id.substring(0, 7)}</td>
                <td className="p-5">
                  <div className="font-bold text-white">{o.customer?.fullName || "N/A"}</div>
                  <div className="text-gray-500 text-xs mt-1">{o.customer?.phone || "N/A"}</div>
                </td>
                <td className="p-5">
                  <div className="text-gray-300">{o.items?.length || 0} món</div>
                  <div className="font-bold text-orange-500 mt-1">{o.totalAmount?.toLocaleString()} đ</div>
                </td>
                <td className="p-5 text-center">
                  <select value={o.status} onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                    className="border border-white/10 bg-[#0a0a0a] px-3 py-2 rounded-lg text-xs font-bold outline-none cursor-pointer text-white focus:border-orange-500 transition-colors">
                    {["Chờ thanh toán", "Chờ xác nhận", "Đang chuẩn bị", "Đang giao", "Đã giao", "Đã hủy"].map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </td>
                <td className="p-5 text-center">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => setSelectedOrder(o)} className="text-white bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-xl font-bold transition-colors text-xs">Chi tiết</button>
                    <button onClick={() => handleDelete(o._id)} className="text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-xl font-bold transition-colors text-xs">Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Chi Tiết */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
           <div className="bg-[#111] p-8 rounded-3xl w-full max-w-2xl border border-white/10 relative">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-5 right-5 text-gray-400 hover:text-white">✕</button>
              <h2 className="text-xl font-black mb-6 text-white uppercase tracking-wider">Chi tiết đơn #{selectedOrder._id.substring(0, 8)}</h2>
              <div className="overflow-x-auto border border-white/10 rounded-xl">
                <table className="w-full text-left text-sm"><thead className="bg-white/5 border-b border-white/10"><tr><th className="p-4 text-gray-400">Sản phẩm</th><th className="p-4 text-center text-gray-400">SL</th><th className="p-4 text-right text-gray-400">Đơn giá</th></tr></thead>
                  <tbody>
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx} className="border-b border-white/5"><td className="p-4 text-white font-bold">{item.name}</td><td className="p-4 text-center text-gray-400">x{item.quantity}</td><td className="p-4 text-right text-orange-500 font-bold">{(item.price).toLocaleString()} ₫</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}