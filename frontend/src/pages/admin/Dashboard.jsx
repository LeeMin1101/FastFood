import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiPieChart, 
  FiShoppingCart, 
  FiGrid, 
  FiPackage, 
  FiImage, 
  FiUsers, 
  FiMessageCircle, 
  FiMenu, 
  FiX, 
  FiTag 
} from "react-icons/fi";

import Overview from "./Overview";
import OrderManager from "./OrderManager";
import BannerManager from "./BannerManager";
import ProductManager from "./ProductManager";
import UserManager from "./UserManager";
import TableManager from "./TableManager";
import AdminChat from "./AdminChat";
import AdminCoupon from "./AdminCoupon";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleInitiateChat = (user) => {
    setSelectedChatUser(user._id);
    setActiveTab("chat");
  };

  const tabs = [
    { id: "overview", icon: <FiPieChart />, label: "Tổng quan" },
    { id: "orders", icon: <FiShoppingCart />, label: "Đơn hàng" },
    { id: "tables", icon: <FiGrid />, label: "Đặt bàn" },
    { id: "products", icon: <FiPackage />, label: "Sản phẩm" },
    { id: "coupons", icon: <FiTag />, label: "Mã giảm giá" },
    { id: "banners", icon: <FiImage />, label: "Banner" },
    { id: "users", icon: <FiUsers />, label: "Khách hàng" },
    { id: "chat", icon: <FiMessageCircle />, label: "CSKH" }
  ];

  return (
    <div className="h-screen w-full overflow-hidden bg-[#0a0a0a] flex font-sans text-gray-200">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#111] border-r border-white/5 p-6 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center justify-between mb-10 mt-4 relative">
          <div className="flex w-full items-center justify-center">
            <img src="/img/MTK.png" alt="MTK FastFood Logo" className="w-40 h-auto object-contain drop-shadow-[0_0_15px_rgba(249,115,22,0.2)]" />
          </div>
          <button className="lg:hidden absolute -right-2 top-0 text-gray-500 hover:text-white p-2" onClick={() => setIsMobileMenuOpen(false)}>
            <FiX className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all duration-300 ${
                activeTab === tab.id 
                ? "bg-orange-500/10 text-orange-500 border-r-4 border-orange-500 shadow-[inset_0_0_20px_rgba(249,115,22,0.05)]" 
                : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}>
              <span className="text-xl">{tab.icon}</span>
              <span className="tracking-wide uppercase text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto flex flex-col h-screen relative custom-scrollbar">
        <div className="bg-[#111]/90 backdrop-blur-xl px-4 lg:px-10 py-5 border-b border-white/5 shadow-sm flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-400 bg-white/5 p-2 rounded-lg border border-white/10 hover:text-white" onClick={() => setIsMobileMenuOpen(true)}>
              <FiMenu className="w-5 h-5" />
            </button>
            <h1 className="text-xl lg:text-2xl font-black text-white uppercase tracking-widest drop-shadow-md">
              {activeTab === "overview" && "Tổng quan hệ thống"}
              {activeTab === "orders" && "Quản lý đơn hàng"}
              {activeTab === "tables" && "Quản lý đặt bàn"}
              {activeTab === "products" && "Kho sản phẩm"}
              {activeTab === "coupons" && "Chiến dịch giảm giá"}
              {activeTab === "banners" && "Danh sách banner"}
              {activeTab === "users" && "Thông tin khách hàng"}
              {activeTab === "chat" && "Trung tâm CSKH"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/" className="hidden sm:block text-gray-400 hover:text-orange-500 font-bold text-sm uppercase tracking-wider transition-colors">Về Website</Link>
            <div className="hidden sm:block w-px h-6 bg-white/10 mx-2"></div>
            <button onClick={handleLogout} className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 px-5 py-2 rounded-xl font-bold text-sm uppercase tracking-wider transition-all">Đăng xuất</button>
          </div>
        </div>

        <div className="p-4 lg:p-8 max-w-[1400px] mx-auto w-full flex-1">
          {activeTab === "overview" && <Overview />}
          {activeTab === "orders" && <OrderManager />}
          {activeTab === "tables" && <TableManager />}
          {activeTab === "products" && <ProductManager />}
          {activeTab === "coupons" && <AdminCoupon />}
          {activeTab === "banners" && <BannerManager />}
          {activeTab === "users" && <UserManager onInitiateChat={handleInitiateChat} />}
          {activeTab === "chat" && <AdminChat externalActiveClient={selectedChatUser} />}
        </div>
      </div>
    </div>
  );
}