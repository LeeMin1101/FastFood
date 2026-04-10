import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { SERVER_URL } from "../config";
import { FiPackage, FiUser, FiStar, FiLogOut, FiEdit2, FiXCircle, FiLock } from "react-icons/fi";

export default function UserProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState("orders");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [orders, setOrders] = useState([]);

  // State quản lý form và avatar
  const [formData, setFormData] = useState({ name: user.name || "", phone: user.phone || "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(user.avatar ? `${SERVER_URL}${user.avatar}` : null);
  const [isUpdating, setIsUpdating] = useState(false);

  // State quản lý đổi mật khẩu
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  const fetchMyOrders = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/orders/my-orders`, getAuthHeader());
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
      if (error.response && error.response.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại nhé!");
        handleLogout();
      }
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file)); 
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const data = new FormData();
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    if (avatarFile) data.append("avatar", avatarFile); 

    try {
      const config = { headers: { ...getAuthHeader().headers, "Content-Type": "multipart/form-data" } };
      const res = await axios.put(`${SERVER_URL}/api/auth/profile`, data, config);
      
      const updatedUser = { ...user, name: res.data.name, phone: res.data.phone, avatar: res.data.avatar };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      alert("Cập nhật thông tin thành công! 🎉");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại nhé!");
        handleLogout();
      } else {
        alert("Lỗi khi cập nhật: " + (error.response?.data?.error || "Vui lòng thử lại"));
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Hàm xử lý đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert("Mật khẩu mới phải có ít nhất 8 ký tự!");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await axios.put(`${SERVER_URL}/api/auth/change-password`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      }, getAuthHeader());
      
      alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      handleLogout();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi đổi mật khẩu, vui lòng thử lại.");
    } finally {
      setIsChangingPassword(false);
    }
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
    if (status === "Đã hủy") return <div className="text-red-500 font-bold mt-4 flex items-center gap-2"><FiXCircle /> Đơn hàng đã bị hủy</div>;

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
                <span className={`text-[10px] sm:text-xs mt-2 font-bold uppercase tracking-wider ${isCompleted ? "text-orange-600" : "text-gray-400"}`}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-24 md:py-32 bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Điều hướng */}
        <div className="w-full md:w-1/4">
          <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm p-6 md:p-8 sticky top-32">
            <div className="flex flex-col items-center text-center border-b border-gray-100 pb-6 mb-6 relative group">
              
              <div 
                onClick={() => fileInputRef.current.click()}
                className="w-28 h-28 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-lg mb-4 cursor-pointer relative overflow-hidden border-[5px] border-white ring-2 ring-orange-100 bg-gradient-to-tr from-orange-400 to-red-500 transition-all group-hover:ring-orange-300"
              >
                {previewAvatar ? (
                  <img src={previewAvatar} alt="Avatar" crossOrigin="anonymous" className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
                
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiEdit2 className="text-white text-xl mb-1" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Đổi ảnh</span>
                </div>
              </div>
              
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />

              <h2 className="text-xl font-black text-gray-900">{user.name}</h2>
              <p className="text-sm font-medium text-gray-500 mt-1 truncate w-full px-2">{user.email}</p>
              <div className="mt-4 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-bold border border-orange-200 flex items-center gap-1">
                <FiStar className="text-sm fill-orange-500" /> {vipLevel}
              </div>
            </div>

            <nav className="space-y-2">
              <button onClick={() => setActiveTab("orders")} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all font-bold text-sm ${activeTab === "orders" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "text-gray-600 hover:bg-gray-100 hover:text-orange-600"}`}>
                <FiPackage className="text-lg" /> Lịch sử & Theo dõi đơn
              </button>
              <button onClick={() => setActiveTab("profile")} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all font-bold text-sm ${activeTab === "profile" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "text-gray-600 hover:bg-gray-100 hover:text-orange-600"}`}>
                <FiUser className="text-lg" /> Thông tin cá nhân
              </button>
              <button onClick={() => setActiveTab("vip")} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all font-bold text-sm ${activeTab === "vip" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "text-gray-600 hover:bg-gray-100 hover:text-orange-600"}`}>
                <FiStar className="text-lg" /> Điểm thưởng & VIP
              </button>
            </nav>

            <button onClick={handleLogout} className="w-full mt-8 flex items-center justify-center gap-2 p-3.5 text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-xl font-bold transition-all text-sm uppercase tracking-widest">
              <FiLogOut className="text-lg" /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Nội dung chi tiết */}
        <div className="w-full md:w-3/4">
          
          {/* TAB ĐƠN HÀNG */}
          {activeTab === "orders" && (
            <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm p-6 md:p-10 min-h-full">
              <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-wide flex items-center gap-3">
                <FiPackage className="text-orange-500 text-3xl" /> Đơn hàng của tôi
              </h2>
              
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <FiPackage className="text-6xl mb-4 text-gray-300" />
                  <p className="font-bold text-lg text-gray-500">Bạn chưa có đơn hàng nào.</p>
                  <p className="text-sm mt-1 mb-6">Hãy đặt ngay một món ăn ngon nhé!</p>
                  <Link to="/menu" className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors uppercase tracking-widest text-sm">Đi mua sắm</Link>
                </div>
              ) : (
                <div className="space-y-8">
                  {orders.map(order => (
                    <div key={order._id} className="border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 bg-white group">
                      <div className="flex flex-wrap justify-between items-start mb-6 gap-4 border-b border-gray-100 pb-4">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mã đơn hàng</p>
                          <p className="font-black text-gray-900 text-lg mt-0.5">#{order._id.substring(0, 9).toUpperCase()}</p>
                          <p className="text-xs font-medium text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tổng tiền</p>
                          <p className="text-2xl font-black text-orange-600">{order.totalAmount.toLocaleString()} ₫</p>
                        </div>
                      </div>

                      <div className="py-2 space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <span className="font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-md text-xs">{item.quantity}x</span>
                              <span className="font-bold text-gray-800">{item.name}</span>
                            </div>
                            <span className="font-black text-gray-900">{(item.price * item.quantity).toLocaleString()} ₫</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <p className="font-black text-gray-900 uppercase tracking-wider text-sm">Trạng thái đơn hàng</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Đã hủy' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                            {order.status}
                          </span>
                        </div>
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
            <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm p-6 md:p-10 min-h-full">
              {/* PHẦN 1: CẬP NHẬT THÔNG TIN */}
              <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-wide flex items-center gap-3 border-b border-gray-100 pb-4">
                <FiUser className="text-orange-500 text-3xl" /> Thông tin cá nhân
              </h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg mb-12">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Họ và tên</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all bg-white text-gray-900 font-medium placeholder-gray-400 shadow-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Số điện thoại</label>
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all bg-white text-gray-900 font-medium placeholder-gray-400 shadow-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email (Không thể thay đổi)</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    disabled 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-100 text-gray-500 cursor-not-allowed font-medium shadow-inner" 
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isUpdating} 
                  className={`w-full sm:w-auto text-white font-black uppercase tracking-widest text-sm py-4 px-8 rounded-xl shadow-lg transition-all ${isUpdating ? "bg-gray-400 cursor-wait" : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:-translate-y-1 shadow-orange-500/30"}`}
                >
                  {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </form>

              {/* PHẦN 2: ĐỔI MẬT KHẨU */}
              <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-wide flex items-center gap-3 border-b border-gray-100 pb-4">
                <FiLock className="text-orange-500 text-2xl" /> Đổi mật khẩu
              </h2>
              
              <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mật khẩu hiện tại</label>
                  <input 
                    type="password" 
                    required
                    value={passwordData.oldPassword} 
                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all bg-white text-gray-900 font-medium placeholder-gray-400 shadow-sm" 
                    placeholder="Nhập mật khẩu hiện tại..."
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mật khẩu mới</label>
                    <input 
                      type="password" 
                      required
                      value={passwordData.newPassword} 
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all bg-white text-gray-900 font-medium placeholder-gray-400 shadow-sm" 
                      placeholder="Mật khẩu mới (Tối thiểu 8 ký tự)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nhập lại mật khẩu</label>
                    <input 
                      type="password" 
                      required
                      value={passwordData.confirmPassword} 
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all bg-white text-gray-900 font-medium placeholder-gray-400 shadow-sm" 
                      placeholder="Xác nhận mật khẩu mới"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isChangingPassword} 
                  className={`w-full sm:w-auto text-white font-black uppercase tracking-widest text-sm py-4 px-8 rounded-xl shadow-lg transition-all ${isChangingPassword ? "bg-gray-400 cursor-wait" : "bg-gray-900 hover:bg-gray-800 hover:-translate-y-1 shadow-gray-900/30"}`}
                >
                  {isChangingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>
              </form>
            </div>
          )}

          {/* TAB VIP */}
          {activeTab === "vip" && (
            <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm p-6 md:p-10 min-h-full">
              <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-wide flex items-center gap-3">
                <FiStar className="text-orange-500 text-3xl" /> Khách hàng thân thiết
              </h2>
              <p className="text-gray-500 font-medium mb-10">Tích lũy chi tiêu để thăng hạng và nhận nhiều ưu đãi đặc quyền từ MTK FastFood.</p>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-gray-800">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 blur-3xl rounded-full"></div>
                <div className="absolute top-4 right-6 text-7xl opacity-20 transform rotate-12">👑</div>
                
                <div className="relative z-10">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Hạng hiện tại</h3>
                  <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 drop-shadow-md">{vipLevel}</p>
                  
                  <div className="mt-12">
                    <div className="flex justify-between text-sm md:text-base mb-3 font-bold text-white">
                      <span>Đã chi: {totalSpent.toLocaleString()} ₫</span>
                      {nextLevelGoal > 0 ? <span className="text-orange-300">Mục tiêu: {nextLevelGoal.toLocaleString()} ₫</span> : <span className="text-yellow-400">Max Level 🎉</span>}
                    </div>
                    
                    <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden shadow-inner p-0.5">
                      <div className="bg-gradient-to-r from-orange-500 to-yellow-400 h-full rounded-full shadow-md relative" style={{ width: `${progressPercent}%` }}>
                        <div className="absolute inset-0 bg-white/20 w-full animate-pulse rounded-full"></div>
                      </div>
                    </div>
                    
                    {nextLevelGoal > 0 && (
                      <p className="text-sm font-medium text-gray-400 mt-4">
                        Chỉ còn mua thêm <span className="font-black text-orange-400">{(nextLevelGoal - totalSpent).toLocaleString()} ₫</span> nữa để thăng hạng tiếp theo!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}