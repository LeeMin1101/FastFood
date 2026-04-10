import React, { useState, useEffect } from "react";
import axios from "axios";
import { SERVER_URL } from "../../config";

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: "", startDate: "", endDate: "", isActive: true, image: "", imageFile: null });

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
  
  const getImageUrl = (img) => {
    if (!img) return "";
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    return `${SERVER_URL}${img.startsWith('/') ? img : '/' + img}`;
  };

  const handleBannerError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/800x400/1a1a1a/ea580c?text=Banner+Not+Found";
  };

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/banners`, getAuthHeader());
      setBanners(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const config = { 
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`, 
          "Content-Type": "multipart/form-data" 
        } 
      };
      
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("startDate", formData.startDate);
      submitData.append("endDate", formData.endDate);
      submitData.append("isActive", formData.isActive);
      
      if (formData.imageFile) {
        submitData.append("image", formData.imageFile);
      } else if (formData.image) {
        submitData.append("image", formData.image);
      }

      if (editId) {
        const res = await axios.put(`${SERVER_URL}/api/banners/${editId}`, submitData, config);
        setBanners(banners.map(b => b._id === editId ? res.data : b));
      } else {
        const res = await axios.post(`${SERVER_URL}/api/banners`, submitData, config);
        setBanners([res.data, ...banners]);
      }
      setIsModalOpen(false);
    } catch (e) { console.error(e); }
  };

  // Tính năng xóa Banner
  const handleDeleteBanner = async (id) => {
    if (window.confirm("Xác nhận xóa banner này?")) {
      try {
        await axios.delete(`${SERVER_URL}/api/banners/${id}`, getAuthHeader());
        setBanners(banners.filter(b => b._id !== id));
      } catch(e) { console.error(e); }
    }
  };

  // Tính năng Bật/Tắt hiển thị Banner nhanh ngoài bảng
  const handleToggleBannerActive = async (banner) => {
    try {
      const res = await axios.put(`${SERVER_URL}/api/banners/${banner._id}`, { ...banner, isActive: !banner.isActive }, getAuthHeader());
      setBanners(banners.map(b => b._id === banner._id ? res.data : b));
    } catch(e) { console.error(e); }
  };

  return (
    <div className="w-full">
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => { 
            setEditId(null); 
            setFormData({ title: "", startDate: "", endDate: "", isActive: true, image: "", imageFile: null }); 
            setIsModalOpen(true); 
          }} 
          className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 hover:-translate-y-0.5 transition-all uppercase text-sm tracking-wider"
        >
          + Thêm Banner
        </button>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-3xl shadow-xl overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-5 font-bold">Hình Ảnh</th>
                <th className="p-5 font-bold">Tiêu Đề</th>
                <th className="p-5 font-bold">Thời Gian Hiệu Lực</th>
                <th className="p-5 font-bold text-center">Hiển Thị</th>
                <th className="p-5 font-bold text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {banners.map((b) => {
                const now = new Date();
                const start = new Date(b.startDate);
                const end = new Date(b.endDate);
                const actuallyShowing = b.isActive && (now >= start && now <= end);

                return (
                  <tr key={b._id} className={`hover:bg-white/5 transition-colors ${!actuallyShowing ? "opacity-50" : ""}`}>
                    <td className="p-4">
                      <img src={getImageUrl(b.image)} onError={handleBannerError} className="w-32 h-14 object-cover rounded-xl border border-white/10 shadow-md" alt=""/>
                    </td>
                    <td className="p-4 font-bold text-white tracking-wide">{b.title}</td>
                    <td className="p-4 text-xs font-medium">
                      <div className="text-gray-300 flex items-center gap-2">
                        <span className="text-gray-500 w-10 uppercase">Bắt đầu:</span> {start.toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-gray-300 mt-1.5 flex items-center gap-2">
                        <span className="text-gray-500 w-10 uppercase">Kết thúc:</span> {end.toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleToggleBannerActive(b)} 
                        className={`relative inline-flex h-6 w-11 rounded-full border border-white/10 transition-colors ${b.isActive ? 'bg-orange-500' : 'bg-gray-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 bg-white rounded-full mt-0.5 transition-transform ${b.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => { 
                            setEditId(b._id); 
                            setFormData({...b, startDate: b.startDate.split('T')[0], endDate: b.endDate.split('T')[0], imageFile: null}); 
                            setIsModalOpen(true); 
                          }} 
                          className="text-white bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                        >
                          Sửa
                        </button>
                        <button 
                          onClick={() => handleDeleteBanner(b._id)} 
                          className="text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
           <div className="bg-[#111] p-8 rounded-3xl w-full max-w-lg border border-white/10 shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-gray-500 hover:text-white font-bold p-2 bg-white/5 rounded-full w-8 h-8 flex items-center justify-center transition-colors">✕</button>
              <h2 className="text-xl font-black mb-6 text-white uppercase tracking-widest">{editId ? "Sửa Banner" : "Thêm Banner"}</h2>
              
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Tên/Tiêu đề Banner</label>
                  <input required type="text" placeholder="Ví dụ: Khuyến mãi Tết" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-orange-500 transition-colors" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Ngày bắt đầu</label>
                    <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 p-3.5 rounded-xl text-gray-300 outline-none focus:border-orange-500 transition-colors cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Ngày kết thúc</label>
                    <input required type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 p-3.5 rounded-xl text-gray-300 outline-none focus:border-orange-500 transition-colors cursor-pointer" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Hình Ảnh (Tải lên từ thiết bị)</label>
                  <div className="relative border border-dashed border-white/20 bg-[#0a0a0a] rounded-xl p-4 hover:border-orange-500/50 transition-colors">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setFormData({...formData, imageFile: e.target.files[0]})}
                      className="w-full text-gray-400 text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-orange-500/10 file:text-orange-500 hover:file:bg-orange-500/20 hover:file:text-orange-400 transition-colors cursor-pointer" 
                    />
                  </div>
                  {editId && !formData.imageFile && formData.image && (
                    <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-wide">
                      * Đang dùng ảnh cũ. Chọn file mới nếu muốn đổi ảnh.
                    </p>
                  )}
                </div>

                <label className="flex items-center gap-3 p-4 bg-[#0a0a0a] border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors mt-2">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 accent-orange-500" />
                  <span className="text-sm font-bold text-gray-300">Cho phép Banner hiển thị ra trang chủ</span>
                </label>

                <button type="submit" className="w-full bg-orange-500 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:bg-orange-600 transition-all mt-6 uppercase tracking-widest">
                  Lưu Lại
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}