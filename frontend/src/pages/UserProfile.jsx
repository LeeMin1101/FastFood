import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function UserProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState("orders");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [orders, setOrders] = useState([]);
  
  const SERVER_URL = "https://mtk-fastfood.onrender.com";

  // State quản lý form và avatar
  const [formData, setFormData] = useState({ name: user.name || "", phone: user.phone || "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(user.avatar ? `${SERVER_URL}${user.avatar}` : null);
  const [isUpdating, setIsUpdating] = useState(false);

  const getAuthHeader = () => {
    return { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
  };

  useEffect(() => {
    if (!user.id) {
      navigate("/login");
      return;
    }
    fetchMyOrders();
  }, [navigate, user.id]);

  // HÀM FETCH ĐƠN HÀNG THẬT TỪ DATABASE
  const fetchMyOrders = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/orders/my-orders`, getAuthHeader());
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    }
  };

  // HÀM CHỌN ẢNH TỪ MÁY TÍNH
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file)); // Hiển thị ảnh xem trước ngay lập tức
    }
  };

  // HÀM LƯU THÔNG TIN & AVATAR LÊN SERVER
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const data = new FormData();
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    if (avatarFile) data.append("avatar", avatarFile); // Đính kèm file ảnh nếu có

    try {
      const config = { headers: { ...getAuthHeader().headers, "Content-Type": "multipart/form-data" } };
      const res = await axios.put(`${SERVER_URL}/api/auth/profile`, data, config);
      
      // Cập nhật lại Storage và State sau khi lưu thành công
      const updatedUser = { ...user, name: res.data.name, phone: res.data.phone, avatar: res.data.avatar };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      alert("Cập nhật thông tin thành công! 🎉");
    } catch (error) {
      alert("Lỗi khi cập nhật: " + (error.response?.data?.error || "Vui lòng thử lại"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  const totalSpent = orders.filter(o => o.status === "Đã giao").reduce((sum, o) => sum + o.totalAmount, 0);

  let vipLevel = "Thành viên Đồng";
  let nextLevelGoal = 1000000;
  if (totalSpent >= 5000000) { vipLevel = "Thành viên Kim Cương"; nextLevelGoal = 0; }
  else if (totalSpent >= 2000000) { vipLevel = "Thành viên Vàng"; nextLevelGoal = 5000000; }
  else if (totalSpent >= 1000000) { vipLevel = "Thành viên Bạc"; nextLevelGoal = 2000000; }

  const progressPercent = nextLevelGoal === 0 ? 100 : (totalSpent / nextLevelGoal) * 100;

  const renderOrderTracker = (status) => {
    const steps = ["Chờ xác nhận", "Đang chuẩn bị", "Đang giao", "Đã giao"];
    let currentStepIndex = steps.indexOf(status);
    if (status === "Đã hủy") return <div className="text-red-500 font-bold mt-4">❌ Đơn hàng đã bị hủy</div>;

    return (
      <div className="mt-6">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-orange-500 z-0 transition-all duration-500 rounded-full"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          ></div>
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            return (
              <div key={index} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${isCompleted ? "bg-orange-500 border-orange-500 text-white shadow-md" : "bg-white border-gray-300 text-gray-400"}`}>
                  {isCompleted ? "✓" : index + 1}
                </div>
                <span className={`text-[10px] sm:text-xs mt-2 font-medium ${isCompleted ? "text-orange-600" : "text-gray-400"}`}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Điều hướng */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-28">
            <div className="flex flex-col items-center text-center border-b pb-6 mb-6 relative group">
              
              {/* KHU VỰC AVATAR */}
              <div 
                onClick={() => fileInputRef.current.click()}
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-lg mb-4 cursor-pointer relative overflow-hidden border-4 border-white ring-2 ring-orange-200 bg-gradient-to-tr from-orange-400 to-red-500"
              >
                {previewAvatar ? (
                  <img src={previewAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
                
                {/* Overlay hiện lên khi hover chuột vào ảnh */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-medium">Đổi ảnh</span>
                </div>
              </div>
              
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />

              <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="mt-3 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-xs font-bold border border-orange-200">
                💎 {vipLevel}
              </div>
            </div>

            <nav className="space-y-2">
              <button onClick={() => setActiveTab("orders")} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === "orders" ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-50"}`}>
                📦 Lịch sử & Theo dõi đơn
              </button>
              <button onClick={() => setActiveTab("profile")} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === "profile" ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-50"}`}>
                👤 Thông tin cá nhân
              </button>
              <button onClick={() => setActiveTab("vip")} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === "vip" ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-50"}`}>
                🌟 Điểm thưởng & VIP
              </button>
            </nav>

            <button onClick={handleLogout} className="w-full mt-8 flex items-center justify-center gap-2 p-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-colors">
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Nội dung chi tiết */}
        <div className="w-full md:w-3/4">
          
          {/* TAB ĐƠN HÀNG */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-black text-gray-800 mb-6">📦 Đơn hàng của tôi</h2>
              {orders.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-2xl">Bạn chưa có đơn hàng nào. Đi mua sắm thôi!</div>
              ) : (
                <div className="space-y-6">
                  {orders.map(order => (
                    <div key={order._id} className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow bg-gray-50/50">
                      <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Mã đơn: <span className="font-bold text-gray-800">{order._id.substring(0, 9)}</span></p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-red-600">{order.totalAmount.toLocaleString()} đ</p>
                        </div>
                      </div>

                      <div className="border-t border-b border-gray-100 py-4 my-4 space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">{item.quantity}x {item.name}</span>
                            <span className="text-gray-500">{(item.price * item.quantity).toLocaleString()} đ</span>
                          </div>
                        ))}
                      </div>

                      {/* Tiến trình xử lý */}
                      <div className="mt-2">
                        <p className="font-bold text-gray-800 mb-2">Trạng thái: <span className="text-orange-600">{order.status}</span></p>
                        {renderOrderTracker(order.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB THÔNG TIN CÁ NHÂN */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-black text-gray-800 mb-6">👤 Thông tin cá nhân</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-colors bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-colors bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input type="email" value={user.email} disabled className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-100 text-gray-500 cursor-not-allowed" />
                </div>
                <button type="submit" disabled={isUpdating} className={`mt-4 w-full sm:w-auto text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all ${isUpdating ? "bg-gray-400 cursor-wait" : "bg-orange-500 hover:bg-orange-600 hover:-translate-y-0.5"}`}>
                  {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </form>
            </div>
          )}

          {/* TAB VIP */}
          {activeTab === "vip" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-black text-gray-800 mb-2">🌟 Chương trình Khách hàng thân thiết</h2>
              <p className="text-gray-500 mb-8">Tích lũy chi tiêu để thăng hạng và nhận nhiều ưu đãi.</p>
              
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-20 text-8xl">👑</div>
                <h3 className="text-xl text-gray-300 font-medium">Hạng hiện tại</h3>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 mt-1">{vipLevel}</p>
                
                <div className="mt-10 relative z-10">
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span>Đã chi tiêu: {totalSpent.toLocaleString()} đ</span>
                    {nextLevelGoal > 0 ? <span>Mục tiêu: {nextLevelGoal.toLocaleString()} đ</span> : <span>Max Level 🎉</span>}
                  </div>
                  <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-400 to-yellow-400 h-full rounded-full" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  {nextLevelGoal > 0 && (
                    <p className="text-sm text-gray-400 mt-3">Chỉ còn <span className="font-bold text-orange-400">{(nextLevelGoal - totalSpent).toLocaleString()} đ</span> nữa để thăng hạng tiếp theo!</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}