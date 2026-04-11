import React, { useState, useEffect } from "react";
import axios from "axios";
import { SERVER_URL } from "../../config";
import { FiPlus, FiTrash2, FiEdit3, FiTruck, FiX } from "react-icons/fi";

const AdminCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    code: "",
    discountType: "fixed",
    discountValue: "",
    minOrderValue: 0,
    expiryDate: ""
  });

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/coupons`);
      setCoupons(res.data);
    } catch (error) {
      console.error("Lỗi tải danh sách mã:", error);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Chức năng Tạo mới hoặc Cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${SERVER_URL}/api/coupons/${editingId}`, {
          ...formData,
          code: formData.code.toUpperCase()
        });
        alert("Cập nhật mã thành công!");
      } else {
        await axios.post(`${SERVER_URL}/api/coupons/create`, {
          ...formData,
          code: formData.code.toUpperCase()
        });
        alert("Tạo mã thành công!");
      }
      resetForm();
      fetchCoupons();
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Chức năng Xóa
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mã này không?")) {
      try {
        await axios.delete(`${SERVER_URL}/api/coupons/${id}`);
        fetchCoupons();
      } catch (error) {
        alert("Lỗi khi xóa mã");
      }
    }
  };

  // Chuẩn bị dữ liệu để sửa
  const startEdit = (coupon) => {
    setIsEditing(true);
    setEditingId(coupon._id);
    // Format date để khớp với input datetime-local
    const formattedDate = coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().slice(0, 16) : "";
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      expiryDate: formattedDate
    });
  };

  // Tạo nhanh mã Freeship
  const quickCreateFreeship = () => {
    setFormData({
      code: "FREESHIP",
      discountType: "fixed",
      discountValue: 15000,
      minOrderValue: 0,
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 16)
    });
  };

  const resetForm = () => {
    setFormData({ code: "", discountType: "fixed", discountValue: "", minOrderValue: 0, expiryDate: "" });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Form Tạo/Sửa */}
      <div className="bg-[#111] p-6 lg:p-8 rounded-[2rem] border border-white/5 shadow-xl relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {isEditing ? <FiEdit3 className="text-blue-500" /> : <FiPlus className="text-orange-500" />}
            {isEditing ? `Đang sửa mã: ${formData.code}` : "Tạo mã giảm giá mới"}
          </h2>
          {!isEditing && (
            <button 
              onClick={quickCreateFreeship}
              className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-500/20 transition-all"
            >
              <FiTruck /> Tạo nhanh Freeship
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Mã Code</label>
            <input required type="text" name="code" value={formData.code} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white uppercase outline-none focus:border-orange-500 transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Loại giảm</label>
            <select name="discountType" value={formData.discountType} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 cursor-pointer">
              <option value="fixed" className="bg-[#111]">Trừ tiền (₫)</option>
              <option value="percent" className="bg-[#111]">Phần trăm (%)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Giá trị</label>
            <input required type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Đơn tối thiểu</label>
            <input required type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Hết hạn</label>
            <input required type="datetime-local" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500" />
          </div>
          <div className="md:col-span-2 lg:col-span-5 flex justify-end gap-3">
            {isEditing && (
              <button type="button" onClick={resetForm} className="bg-white/5 text-gray-400 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                Hủy sửa
              </button>
            )}
            <button type="submit" className={`${isEditing ? 'bg-blue-600 shadow-blue-500/20' : 'bg-orange-500 shadow-orange-500/20'} text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg`}>
              {isEditing ? "Cập nhật mã" : "Kích hoạt mã"}
            </button>
          </div>
        </form>
      </div>

      {/* Danh sách */}
      <div className="bg-[#111] p-6 lg:p-8 rounded-[2rem] border border-white/5 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Danh sách chiến dịch</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-[0.2em]">
                <th className="pb-4 font-bold">Mã</th>
                <th className="pb-4 font-bold">Mức giảm</th>
                <th className="pb-4 font-bold">Điều kiện</th>
                <th className="pb-4 font-bold">Hết hạn</th>
                <th className="pb-4 font-bold">Trạng thái</th>
                <th className="pb-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="group hover:bg-white/[0.02] transition-all">
                  <td className="py-4 font-black text-orange-500 text-lg uppercase tracking-tighter">{coupon.code}</td>
                  <td className="py-4 font-bold text-white">
                    {coupon.discountType === 'fixed' ? `${coupon.discountValue.toLocaleString()}₫` : `${coupon.discountValue}%`}
                  </td>
                  <td className="py-4 text-sm text-gray-400 font-medium">Đơn từ {coupon.minOrderValue.toLocaleString()}₫</td>
                  <td className="py-4 text-sm text-gray-500 font-mono">{new Date(coupon.expiryDate).toLocaleDateString("vi-VN")}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${new Date() > new Date(coupon.expiryDate) ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                      {new Date() > new Date(coupon.expiryDate) ? 'Expired' : 'Active'}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(coupon)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-all" title="Sửa mã">
                        <FiEdit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(coupon._id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all" title="Xóa mã">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupon;