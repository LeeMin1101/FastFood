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
      fetchTables(); // Refresh lại sơ đồ bàn để bàn vừa đặt chuyển sang đỏ
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
    } catch (error) {
      setStatus({ loading: false, success: false, error: "Có lỗi xảy ra, vui lòng thử lại." });
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 pt-32 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col xl:flex-row min-h-[700px]">
          
          {/* CỘT TRÁI - SƠ ĐỒ BÀN */}
          <div className="xl:w-1/2 bg-black/40 p-8 md:p-12 border-b xl:border-b-0 xl:border-r border-white/10 flex flex-col items-center">
            <img src="/img/MTK.png" alt="MTK FastFood" className="w-32 md:w-40 h-auto mb-6 drop-shadow-2xl opacity-90" />
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Sơ đồ nhà hàng</h2>
            
            {/* Chú thích màu sắc */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-10 text-xs sm:text-sm font-bold text-gray-300 bg-white/5 py-3 px-6 rounded-full border border-white/10">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-white/10 border border-green-500"></div> TRỐNG</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-orange-500 border border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div> ĐANG CHỌN</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/50"></div> ĐÃ ĐẶT</div>
            </div>

            {/* Khung Grid Bàn */}
            <div className="w-full max-w-md bg-white/5 p-6 rounded-3xl border border-white/10 shadow-inner">
              {isLoadingMap ? (
                <div className="text-center text-gray-400 py-10 font-medium animate-pulse">Đang tải sơ đồ nhà hàng...</div>
              ) : tables.length === 0 ? (
                <div className="text-center text-red-400 py-10 font-bold">Lỗi: Không thể kết nối tới sơ đồ bàn (Vui lòng kiểm tra lại Backend API)</div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 md:gap-4 justify-items-center">
                  {tables.map(t => (
                    <button
                      key={t._id}
                      disabled={t.isBooked}
                      onClick={() => setSelectedTable(t.tableNumber)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 outline-none
                        ${t.isBooked 
                          ? 'bg-red-500/10 text-red-500/50 border-2 border-red-500/30 cursor-not-allowed' 
                          : selectedTable === t.tableNumber 
                            ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.6)] border-2 border-orange-400 scale-110 z-10' 
                            : 'bg-white/10 text-green-400 border-2 border-green-500/40 hover:bg-green-500/20 hover:-translate-y-1 hover:shadow-lg'
                        }`}
                    >
                      <span className="text-xs uppercase tracking-wider opacity-60 font-bold leading-none mb-0.5">Bàn</span>
                      <span className="text-xl font-black leading-none">{t.tableNumber}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Ghi chú bếp */}
            <div className="mt-10 w-full max-w-md border-t border-white/10 pt-6 text-center">
              <div className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase">Khu vực bếp & Quầy Order</div>
              <div className="w-1/2 h-1.5 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto mt-3 rounded-full"></div>
            </div>
          </div>

          {/* CỘT PHẢI - FORM ĐIỀN THÔNG TIN (ẨN/HIỆN THÔNG MINH) */}
          <div className="xl:w-1/2 p-8 md:p-12 relative flex flex-col justify-center min-h-[500px]">
            
            {/* THÔNG BÁO THÀNH CÔNG/THẤT BẠI */}
            <AnimatePresence>
              {status.success && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-8 left-8 right-8 p-4 bg-green-500/20 border border-green-500/50 rounded-2xl text-green-400 font-bold text-center shadow-lg z-20">
                  🎉 Yêu cầu đã được gửi! Bàn của bạn đã được giữ. MTK sẽ liên hệ sớm nhất.
                </motion.div>
              )}
              {status.error && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-8 left-8 right-8 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-400 font-bold text-center shadow-lg z-20">
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
                  className="flex flex-col items-center justify-center text-center h-full opacity-60"
                >
                  <div className="w-24 h-24 mb-6 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center animate-spin-slow">
                    <span className="text-4xl block -animate-spin-slow">🍽️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Chưa chọn bàn</h3>
                  <p className="text-gray-400 max-w-sm">
                    Vui lòng nhấp vào một bàn trống (viền xanh) trên sơ đồ bên cạnh để tiến hành đặt chỗ.
                  </p>
                </motion.div>
              ) : (
                // TRẠNG THÁI ĐÃ CHỌN BÀN -> HIỆN FORM
                <motion.div 
                  key="form-state"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}
                  className="w-full"
                >
                  <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-1">Thông tin đặt bàn</h2>
                      <p className="text-orange-400 font-bold text-lg">
                        Bạn đang giữ: <span className="bg-orange-500 text-white px-3 py-1 rounded-lg ml-2 shadow-[0_0_10px_rgba(249,115,22,0.4)]">Bàn {selectedTable}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedTable(null)}
                      className="text-sm font-bold text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-xl transition-all"
                    >
                      Hủy chọn
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tên khách hàng</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-orange-500 focus:bg-white/10 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Số điện thoại</label>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-orange-500 focus:bg-white/10 transition-colors" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ngày đến</label>
                        <input type="date" name="date" required min={today} value={formData.date} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-orange-500 focus:bg-white/10 transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Giờ đến</label>
                        <input type="time" name="time" required value={formData.time} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-orange-500 focus:bg-white/10 transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Số người</label>
                        <input type="number" name="guests" required min="1" max="10" value={formData.guests} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-orange-500 focus:bg-white/10 transition-colors" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ghi chú (Tùy chọn)</label>
                      <textarea name="note" rows="2" value={formData.note} onChange={handleChange} placeholder="Yêu cầu đặc biệt..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-orange-500 focus:bg-white/10 transition-colors resize-none" />
                    </div>

                    <button 
                      type="submit" disabled={status.loading}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/40 mt-4"
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
      
      <style dangerouslySetInnerHTML={{__html: `
        .animate-spin-slow { animation: spin 8s linear infinite; }
      `}} />
    </div>
  );
}