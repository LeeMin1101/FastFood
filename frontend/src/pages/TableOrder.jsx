import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { SERVER_URL } from "../config";

export default function TableOrder() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "", date: "", time: "", guests: 2, note: "" });
  const [status, setStatus] = useState({ loading: false, success: false, error: "" });
  const [isLoadingMap, setIsLoadingMap] = useState(true);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setIsLoadingMap(true);
      const res = await axios.get(`${SERVER_URL}/api/tables`);
      setTables(res.data);
    } catch (error) { 
      console.error("Lỗi lấy sơ đồ bàn"); 
    } finally {
      setIsLoadingMap(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTable) return setStatus({ loading: false, success: false, error: "Vui lòng chọn bàn trên sơ đồ!" });
    
    setStatus({ loading: true, success: false, error: "" });
    try {
      await axios.post(`${SERVER_URL}/api/table-orders`, { ...formData, tableNumber: selectedTable });
      setStatus({ loading: false, success: true, error: "" });
      setFormData({ name: "", phone: "", date: "", time: "", guests: 2, note: "" });
      setSelectedTable(null);
      fetchTables(); 
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
    } catch (error) {
      setStatus({ loading: false, success: false, error: "Có lỗi xảy ra, vui lòng thử lại." });
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    // Đổi nền trang sang Nền trắng/xám nhạt (Light Theme)
    <div className="min-h-screen bg-gray-50 pt-32 pb-24 font-sans text-gray-900">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tiêu đề trang */}
        <div className="flex flex-col items-center justify-center mb-12">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-orange-500 font-bold tracking-[0.3em] text-xs md:text-sm uppercase mb-4"
          >
            Trải nghiệm tuyệt hảo
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 uppercase tracking-tight relative pb-6"
          >
            Đặt Bàn
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-orange-500 rounded-full"></div>
          </motion.h1>
        </div>

        {/* Khối chứa Sơ đồ & Form */}
        <div className="bg-white border border-gray-200 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col xl:flex-row min-h-[700px]">
          
          {/* CỘT TRÁI - SƠ ĐỒ BÀN */}
          <div className="xl:w-1/2 bg-gray-50/50 p-8 md:p-12 border-b xl:border-b-0 xl:border-r border-gray-200 flex flex-col items-center">
            <img src="/img/MTK.png" alt="MTK FastFood" className="w-32 md:w-40 h-auto mb-6 drop-shadow-lg" />
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wide mb-4">Sơ đồ nhà hàng</h2>
            
            {/* Chú thích màu sắc */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-10 text-xs sm:text-sm font-bold text-gray-600 bg-white py-3 px-6 rounded-full border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-white border border-green-500"></div> TRỐNG</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-orange-500 border border-orange-600 shadow-[0_0_10px_rgba(249,115,22,0.3)]"></div> ĐANG CHỌN</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div> ĐÃ ĐẶT</div>
            </div>

            {/* Khung Grid Bàn */}
            <div className="w-full max-w-md bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              {isLoadingMap ? (
                <div className="text-center text-gray-500 py-10 font-medium animate-pulse">Đang tải sơ đồ nhà hàng...</div>
              ) : tables.length === 0 ? (
                <div className="text-center text-red-500 py-10 font-bold">Lỗi: Không thể kết nối tới sơ đồ bàn</div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 md:gap-4 justify-items-center">
                  {tables.map(t => (
                    <button
                      key={t._id}
                      disabled={t.isBooked}
                      onClick={() => setSelectedTable(t.tableNumber)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 outline-none shadow-sm
                        ${t.isBooked 
                          ? 'bg-red-50 text-red-400 border border-red-200 cursor-not-allowed' 
                          : selectedTable === t.tableNumber 
                            ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-[0_5px_15px_rgba(249,115,22,0.4)] border border-orange-600 scale-110 z-10' 
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-green-500 hover:text-green-600 hover:-translate-y-1 hover:shadow-md'
                        }`}
                    >
                      <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-70 font-bold leading-none mb-0.5">Bàn</span>
                      <span className="text-lg sm:text-xl font-black leading-none">{t.tableNumber}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Ghi chú bếp */}
            <div className="mt-10 w-full max-w-md border-t border-gray-200 pt-6 text-center">
              <div className="text-gray-400 text-xs font-bold tracking-[0.2em] uppercase">Khu vực bếp & Quầy Order</div>
              <div className="w-1/2 h-1 bg-gray-200 mx-auto mt-3 rounded-full"></div>
            </div>
          </div>

          {/* CỘT PHẢI - FORM ĐIỀN THÔNG TIN */}
          <div className="xl:w-1/2 p-8 md:p-12 relative flex flex-col justify-center min-h-[500px] bg-white">
            
            {/* THÔNG BÁO THÀNH CÔNG/THẤT BẠI */}
            <AnimatePresence>
              {status.success && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-8 left-8 right-8 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 font-bold text-center shadow-md z-20">
                  🎉 Yêu cầu đã được gửi! Bàn của bạn đã được giữ. MTK sẽ liên hệ sớm nhất.
                </motion.div>
              )}
              {status.error && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-8 left-8 right-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-bold text-center shadow-md z-20">
                  {status.error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!selectedTable ? (
                // TRẠNG THÁI CHƯA CHỌN BÀN
                <motion.div 
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center text-center h-full opacity-70"
                >
                  <div className="w-24 h-24 mb-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <span className="text-4xl block opacity-50">🍽️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa chọn bàn</h3>
                  <p className="text-gray-500 max-w-sm text-sm">
                    Vui lòng nhấp vào một bàn trống trên sơ đồ bên cạnh để tiến hành điền thông tin đặt chỗ.
                  </p>
                </motion.div>
              ) : (
                // TRẠNG THÁI ĐÃ CHỌN BÀN -> HIỆN FORM
                <motion.div 
                  key="form-state"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}
                  className="w-full"
                >
                  <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wide mb-1">Thông tin đặt bàn</h2>
                      <p className="text-gray-600 font-medium text-sm mt-2">
                        Bạn đang giữ: <span className="bg-orange-500 text-white px-3 py-1 rounded-md font-bold ml-1 shadow-sm">Bàn {selectedTable}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedTable(null)}
                      className="text-sm font-bold text-gray-500 hover:text-gray-900 bg-gray-100 border border-gray-200 hover:bg-gray-200 px-4 py-2 rounded-xl transition-all"
                    >
                      Hủy chọn
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Tên khách hàng</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Số điện thoại</label>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all shadow-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Ngày đến</label>
                        <input type="date" name="date" required min={today} value={formData.date} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all shadow-sm cursor-pointer" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Giờ đến</label>
                        <input type="time" name="time" required value={formData.time} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all shadow-sm cursor-pointer" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Số người</label>
                        <input type="number" name="guests" required min="1" max="10" value={formData.guests} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all shadow-sm" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Ghi chú (Tùy chọn)</label>
                      <textarea name="note" rows="2" value={formData.note} onChange={handleChange} placeholder="Yêu cầu đặc biệt..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all shadow-sm resize-none" />
                    </div>

                    <button 
                      type="submit" disabled={status.loading}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-extrabold uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {status.loading ? "Đang xử lý..." : "Xác nhận đặt bàn"}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>
    </div>
  );
}