import React, { useState, useEffect } from "react";
import axios from "axios";
import { SERVER_URL } from "../../config";
import { FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: "", category: "Hamburger", price: "", description: "", calories: "", image: "" });

  const API_URL = `${SERVER_URL}/api/products`;

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

  const getImageUrl = (img) => {
    if (!img) return "https://placehold.co/400x400/222222/666666?text=No+Image";
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    return `${SERVER_URL}${img.startsWith('/') ? img : '/' + img}`;
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/400x400/222222/666666?text=No+Image";
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (e) {
      console.error("Lỗi lấy sản phẩm", e);
    }
  };

  const handleEditProduct = (product) => {
    setEditId(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      calories: product.calories,
      image: product.image || "" 
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault(); 
    try {
      if (editId) {
        const res = await axios.put(`${API_URL}/${editId}`, formData, getAuthHeader());
        setProducts(products.map(p => p._id === editId ? res.data : p));
      } else {
        const res = await axios.post(API_URL, formData, getAuthHeader());
        setProducts([res.data, ...products]);
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error("Lỗi lưu sản phẩm", e);
    }
  };

  const handleDeleteProduct = async (id) => { 
    if (window.confirm("Xác nhận xóa sản phẩm này?")) { 
      try {
        await axios.delete(`${API_URL}/${id}`, getAuthHeader()); 
        setProducts(products.filter(p => p._id !== id)); 
      } catch(e) {
        console.error("Lỗi xóa sản phẩm", e);
      }
    } 
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-white/10 pb-6">
        <h2 className="text-xl lg:text-2xl font-black text-white uppercase tracking-widest">
          Quản lý sản phẩm <span className="text-orange-500 font-bold text-lg">({products.length})</span>
        </h2>
        <button 
          onClick={() => { setEditId(null); setFormData({ name: "", category: "Hamburger", price: "", description: "", calories: "", image: "" }); setIsModalOpen(true); }} 
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5"
        >
          <FiPlus className="text-xl" /> Thêm Món Mới
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
        {products.map((p) => (
          <div key={p._id} className="bg-[#111] border border-white/10 rounded-2xl p-5 shadow-lg hover:shadow-orange-500/10 transition-all flex flex-col group">
            <div className="relative w-full h-40 lg:h-48 rounded-xl overflow-hidden mb-5 bg-gray-900">
              <img src={getImageUrl(p.image)} onError={handleImageError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} />
              <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-orange-400 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                {p.category}
              </span>
            </div>
            <h3 className="font-bold text-gray-100 text-base lg:text-lg line-clamp-2 leading-tight min-h-[3rem]">{p.name}</h3>
            <p className="text-orange-500 font-black text-xl mt-2 mb-4">{Number(p.price).toLocaleString()} ₫</p>
            
            <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/5">
              <button 
                onClick={() => handleEditProduct(p)} 
                className="flex items-center justify-center gap-2 bg-white/5 text-gray-300 font-bold py-2.5 rounded-xl text-sm border border-white/10 hover:bg-white/10 hover:text-white transition-all"
              >
                <FiEdit2 /> Sửa
              </button>
              <button 
                onClick={() => handleDeleteProduct(p._id)} 
                className="flex items-center justify-center gap-2 bg-red-500/10 text-red-500 font-bold py-2.5 rounded-xl text-sm border border-red-500/20 hover:bg-red-500/20 transition-all"
              >
                <FiTrash2 /> Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL THÊM/SỬA - DARK THEME */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
          <div className="bg-[#1a1a1a] p-8 rounded-3xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto border border-white/10 custom-scrollbar">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <FiX className="text-2xl" />
            </button>
            
            <h2 className="text-2xl font-black mb-8 text-white uppercase tracking-wide border-b border-white/10 pb-4">
              {editId ? "Cập Nhật Sản Phẩm" : "Thêm Món Mới"}
            </h2>
            
            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-widest">Tên sản phẩm</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#111] border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-gray-600" placeholder="VD: Gà Rán Giòn Rụm" />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-widest">Giá (VNĐ)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-[#111] border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-gray-600" placeholder="VD: 45000" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-widest">Calories</label>
                  <input required type="number" value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})} className="w-full bg-[#111] border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-gray-600" placeholder="VD: 350" />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-widest">Danh mục</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#111] border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer">
                  {["Burger", "Pizza", "Gà Rán", "Combo", "Nước Uống"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-widest">URL Hình ảnh</label>
                <input required type="text" value={formData.image || ""} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-[#111] border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-gray-600" placeholder="https://..." />
                {formData.image && (
                  <div className="mt-3 p-2 bg-[#111] rounded-xl border border-white/5 w-fit">
                    <img src={formData.image} alt="Preview" className="h-16 w-16 object-cover rounded-lg" onError={handleImageError} />
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-widest">Mô tả chi tiết</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#111] border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all h-28 resize-none placeholder-gray-600" placeholder="Mô tả món ăn..."></textarea>
              </div>
              
              <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-black uppercase tracking-widest py-4 rounded-xl hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/20 transition-all mt-4">
                {editId ? "LƯU THAY ĐỔI" : "THÊM SẢN PHẨM"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}