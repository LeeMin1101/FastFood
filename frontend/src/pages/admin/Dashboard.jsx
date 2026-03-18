import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { SERVER_URL } from "../../config";

const socket = io(SERVER_URL);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]); 
  const [banners, setBanners] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // SỬA: Thay vì imageFile, dùng trực tiếp image URL trong formData
  const [formData, setFormData] = useState({ name: "", category: "Hamburger", price: "", description: "", calories: "", image: "" });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({ name: "", email: "", phone: "", role: "user", password: "" });

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editBannerId, setEditBannerId] = useState(null);
  const [bannerFormData, setBannerFormData] = useState({ title: "", startDate: "", endDate: "", isActive: true, image: "" });

  const [clients, setClients] = useState({});
  const [activeClient, setActiveClient] = useState(null);
  const [replyMsg, setReplyMsg] = useState("");

  const API_URL = `${SERVER_URL}/api/products`;
  const USER_API_URL = `${SERVER_URL}/api/auth/users`;
  const ORDER_API_URL = `${SERVER_URL}/api/orders`; 
  const BANNER_API_URL = `${SERVER_URL}/api/banners`;

  const getAuthHeader = () => {
    return { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    fetchOrders();
    fetchBanners();

    socket.emit("admin_join");
    socket.on("admin_load_history", (allMessages) => {
      const grouped = {};
      allMessages.forEach(msg => {
        if (!grouped[msg.clientId]) grouped[msg.clientId] = { name: msg.clientName, messages: [] };
        grouped[msg.clientId].messages.push(msg);
      });
      setClients(grouped);
    });

    socket.on("admin_receive_message", (newMsg) => {
      setClients((prev) => {
        const existingMessages = prev[newMsg.clientId]?.messages || [];
        return { ...prev, [newMsg.clientId]: { name: newMsg.clientName, messages: [...existingMessages, newMsg] } };
      });
    });

    return () => { 
      socket.off("admin_load_history"); 
      socket.off("admin_receive_message"); 
    };
  }, []);

  const fetchProducts = async () => { try { const res = await axios.get(API_URL); setProducts(res.data); } catch (e) {} };
  const fetchUsers = async () => { try { const res = await axios.get(USER_API_URL, getAuthHeader()); setUsers(res.data); } catch (e) {} };
  const fetchOrders = async () => { try { const res = await axios.get(ORDER_API_URL, getAuthHeader()); setOrders(res.data); } catch (e) {} };
  const fetchBanners = async () => { try { const res = await axios.get(BANNER_API_URL, getAuthHeader()); setBanners(res.data); } catch (e) {} };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${ORDER_API_URL}/${orderId}/status`, { status: newStatus }, getAuthHeader());
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (e) { alert("Lỗi cập nhật trạng thái!"); }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Xóa đơn hàng này?")) {
      try {
        await axios.delete(`${ORDER_API_URL}/${orderId}`, getAuthHeader());
        setOrders(orders.filter(o => o._id !== orderId));
        setSelectedOrder(null); 
      } catch (e) { alert("Lỗi xóa đơn hàng."); }
    }
  };

  // --- HÀM MỚI BỔ SUNG: XỬ LÝ CLICK NÚT SỬA SẢN PHẨM ---
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

  // --- SỬA LẠI HÀM LƯU: Truyền thẳng formData JSON (không dùng FormData object nữa) ---
  const handleSaveProduct = async (e) => {
    e.preventDefault(); 
    try {
      const config = getAuthHeader(); // Bỏ multipart/form-data vì ta gửi chuỗi text bình thường
      if (editId) {
        const res = await axios.put(`${API_URL}/${editId}`, formData, config);
        setProducts(products.map(p => p._id === editId ? res.data : p));
      } else {
        const res = await axios.post(API_URL, formData, config);
        setProducts([res.data, ...products]);
      }
      setIsModalOpen(false);
    } catch (e) { alert("Lỗi lưu sản phẩm"); }
  };

  const handleDeleteProduct = async (id) => { 
    if (window.confirm("Xóa sản phẩm?")) { 
      await axios.delete(`${API_URL}/${id}`, getAuthHeader()); 
      setProducts(products.filter(p => p._id !== id)); 
    } 
  };

  const handleEditUserClick = (u) => { 
    setEditingUser(u); 
    setUserFormData({ name: u.name, email: u.email, phone: u.phone, role: u.role, password: "" }); 
    setIsUserModalOpen(true); 
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...userFormData };
      if (!dataToSend.password) delete dataToSend.password;
      const res = await axios.put(`${USER_API_URL}/${editingUser._id}`, dataToSend, getAuthHeader());
      setUsers(users.map(u => u._id === editingUser._id ? res.data.user : u));
      setIsUserModalOpen(false);
    } catch (e) { alert("Lỗi cập nhật User"); }
  };

  const handleDeleteUser = async (id) => { 
    if (window.confirm("Xóa tài khoản này?")) { 
      await axios.delete(`${USER_API_URL}/${id}`, getAuthHeader()); 
      setUsers(users.filter(u => u._id !== id)); 
    } 
  };

  const handleEditBannerClick = (b) => {
    setEditBannerId(b._id);
    setBannerFormData({ 
      title: b.title, 
      startDate: new Date(b.startDate).toISOString().split('T')[0],
      endDate: new Date(b.endDate).toISOString().split('T')[0],
      isActive: b.isActive,
      image: b.image || ""
    });
    setIsBannerModalOpen(true);
  };

  // --- SỬA LẠI HÀM LƯU BANNER: Dùng JSON thuần ---
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      const config = getAuthHeader();
      if (editBannerId) {
        const res = await axios.put(`${BANNER_API_URL}/${editBannerId}`, bannerFormData, config);
        setBanners(banners.map(b => b._id === editBannerId ? res.data : b));
      } else {
        const res = await axios.post(BANNER_API_URL, bannerFormData, config);
        setBanners([res.data, ...banners]);
      }
      setIsBannerModalOpen(false);
    } catch (e) { alert("Lỗi lưu Banner"); }
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm("Xóa Banner này?")) {
      await axios.delete(`${BANNER_API_URL}/${id}`, getAuthHeader());
      setBanners(banners.filter(b => b._id !== id));
    }
  };

  const handleToggleBannerActive = async (banner) => {
    try {
      const res = await axios.put(`${BANNER_API_URL}/${banner._id}`, { ...banner, isActive: !banner.isActive }, getAuthHeader());
      setBanners(banners.map(b => b._id === banner._id ? res.data : b));
    } catch(e) { alert("Lỗi cập nhật trạng thái"); }
  };

  const handleClearChat = () => {
    if(!activeClient) return;
    if(window.confirm("Xóa lịch sử trò chuyện này?")) {
      socket.emit("admin_clear_chat", activeClient); 
      const newClients = {...clients}; delete newClients[activeClient];
      setClients(newClients); setActiveClient(null);
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault(); 
    if (!replyMsg.trim() || !activeClient) return;
    setClients((prev) => ({ 
      ...prev, 
      [activeClient]: { 
        ...prev[activeClient], 
        messages: [...prev[activeClient].messages, { sender: "admin", text: replyMsg }] 
      } 
    }));
    socket.emit("admin_reply_message", { targetClientId: activeClient, clientName: clients[activeClient].name, message: replyMsg });
    setReplyMsg("");
  };

  const getImageUrl = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    return `${SERVER_URL}${img.startsWith('/') ? img : '/' + img}`;
  };

  const handleAvatarError = (e, name) => {
    e.target.onerror = null;
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=f97316&color=fff&bold=true`;
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/400x400/f3f4f6/a1a1aa?text=No+Image";
  };

  const handleBannerError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/800x400/f3f4f6/a1a1aa?text=Banner+Not+Found";
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Chờ xác nhận": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Đang chuẩn bị": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Đang giao": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Đã giao": return "bg-green-100 text-green-700 border-green-200";
      case "Đã hủy": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const totalRevenue = orders.filter(o => o.status === "Đã giao").reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const totalUsersCount = users.filter(u => u.role === "user").length;

  const COLORS = ['#FBBF24', '#60A5FA', '#A78BFA', '#34D399', '#F87171'];
  const orderStatusData = [
    { name: 'Chờ xác nhận', value: orders.filter(o => o.status === "Chờ xác nhận").length },
    { name: 'Đang chuẩn bị', value: orders.filter(o => o.status === "Đang chuẩn bị").length },
    { name: 'Đang giao', value: orders.filter(o => o.status === "Đang giao").length },
    { name: 'Đã giao', value: orders.filter(o => o.status === "Đã giao").length },
    { name: 'Đã hủy', value: orders.filter(o => o.status === "Đã hủy").length },
  ].filter(item => item.value > 0); 

  const revenueByDate = orders.filter(o => o.status === "Đã giao").reduce((acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'});
      acc[date] = (acc[date] || 0) + order.totalAmount;
      return acc;
  }, {});
  
  const revenueChartData = Object.keys(revenueByDate).map(date => ({ 
    date: date, 
    revenue: revenueByDate[date] 
  })).slice(-7); 

  const userSpending = {};
  orders.filter(o => o.status === "Đã giao").forEach(o => {
    const key = o.customer?.phone || "Khách ẩn danh";
    if (!userSpending[key]) {
      userSpending[key] = { name: o.customer?.fullName || "Khách vãng lai", phone: key, totalSpent: 0, orderCount: 0 };
    }
    userSpending[key].totalSpent += o.totalAmount;
    userSpending[key].orderCount += 1;
  });
  const topUsersList = Object.values(userSpending).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

  const productSales = {};
  orders.filter(o => o.status !== "Đã hủy").forEach(o => {
    o.items?.forEach(item => {
      if (!productSales[item.name]) {
        productSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productSales[item.name].quantity += item.quantity;
      productSales[item.name].revenue += (item.price * item.quantity);
    });
  });
  const topProductsList = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 flex font-sans">
      
      <div className="w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 text-white p-6 shadow-2xl flex flex-col z-10 relative">
        <div className="flex items-center gap-3 mb-12 mt-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-red-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-orange-500/30">M</div>
          <h2 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
            MTK ADMIN
          </h2>
        </div>
        
        <nav className="space-y-3 flex-1">
          {[
            { id: "overview", icon: "📊", label: "Tổng quan bán hàng" },
            { id: "orders", icon: "🛒", label: "Quản lý Đơn hàng" },
            { id: "products", icon: "🍔", label: "Kho & Sản phẩm" },
            { id: "banners", icon: "🖼️", label: "Quản lý Banner" },
            { id: "users", icon: "👥", label: "Quản lý Khách hàng" },
            { id: "chat", icon: "💬", label: "Hỗ trợ Trực tuyến" }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 ${
                activeTab === tab.id 
                ? "bg-gradient-to-r from-orange-500 to-red-600 shadow-lg shadow-orange-500/25 text-white translate-x-1" 
                : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}>
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white/10 backdrop-blur-xl px-10 py-6 border-b border-white/10 shadow-2xl flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-black text-white">
              {activeTab === "overview" && "Báo Cáo & Phân Tích Kinh Doanh"}
              {activeTab === "orders" && "Bảng Điều Khiển Đơn Hàng"}
              {activeTab === "products" && "Quản Lý Sản Phẩm & Tồn Kho"}
              {activeTab === "banners" && "Quản Lý Banner Quảng Cáo"}
              {activeTab === "users" && "Thông Tin Chi Tiết Khách Hàng"}
              {activeTab === "chat" && "Trung Tâm Chăm Sóc Khách Hàng"}
            </h1>
            <p className="text-sm text-gray-400 mt-1">Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')}</p>
          </div>
          {activeTab === "products" && (
            <button onClick={() => { setEditId(null); setFormData({ name: "", category: "Hamburger", price: "", description: "", calories: "", image: "" }); setIsModalOpen(true); }} 
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2">
              <span>+</span> Thêm Món Mới
            </button>
          )}
          {activeTab === "banners" && (
            <button onClick={() => { setEditBannerId(null); setBannerFormData({ title: "", startDate: "", endDate: "", isActive: true, image: "" }); setIsBannerModalOpen(true); }} 
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2">
              <span>+</span> Thêm Banner
            </button>
          )}
        </div>

        <div className="p-10 max-w-7xl mx-auto">
          
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-gray-200 font-bold mb-1">Tổng Doanh Thu</h3>
                    <p className="text-4xl font-black text-orange-300">{totalRevenue.toLocaleString()} ₫</p>
                  </div>
                  <span className="absolute -bottom-4 -right-4 text-8xl opacity-10">💰</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-gray-200 font-bold mb-1">Tổng Đơn Hàng</h3>
                    <p className="text-4xl font-black text-blue-300">{totalOrdersCount}</p>
                  </div>
                  <span className="absolute -bottom-4 -right-4 text-8xl opacity-10">📦</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-gray-200 font-bold mb-1">Khách Hàng</h3>
                    <p className="text-4xl font-black text-orange-300">{totalUsersCount}</p>
                  </div>
                  <span className="absolute -bottom-4 -right-4 text-8xl opacity-10">👥</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">📈 Biểu đồ doanh thu 7 ngày qua</h3>
                  <div className="h-[300px] w-full">
                    {revenueChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueChartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} width={80} tickFormatter={(value) => value.toLocaleString()} />
                          <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(15,23,42,0.9)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)'}} formatter={(value) => [`${value.toLocaleString()} ₫`, 'Doanh thu']} />
                          <Bar dataKey="revenue" fill="#F97316" radius={[6, 6, 6, 6]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <div className="w-full h-full flex items-center justify-center text-gray-400 italic">Chưa có dữ liệu doanh thu</div>}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">📊 Tỉ lệ trạng thái đơn hàng</h3>
                  <div className="h-[300px] w-full">
                    {orderStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" >
                            {orderStatusData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(15,23,42,0.9)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)'}} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div className="w-full h-full flex items-center justify-center text-gray-400 italic">Chưa có dữ liệu đơn hàng</div>}
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {orderStatusData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs font-bold text-gray-300">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                        {entry.name} ({entry.value})
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-white/10 bg-white/5">
                    <h3 className="text-lg font-black text-orange-300 flex items-center gap-2">👑 Bảng Xếp Hạng Khách Hàng VIP</h3>
                    <p className="text-xs text-gray-400 mt-1">Top 5 khách hàng chi tiêu nhiều nhất để gửi ưu đãi.</p>
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/5 border-b border-white/10 text-gray-400">
                        <tr>
                          <th className="p-4 font-bold">Khách hàng / SĐT</th>
                          <th className="p-4 font-bold text-center">Số đơn</th>
                          <th className="p-4 font-bold text-right">Tổng chi tiêu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {topUsersList.length > 0 ? topUsersList.map((u, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-white flex items-center gap-2">
                                {idx === 0 && <span className="text-xl">🥇</span>}
                                {idx === 1 && <span className="text-xl">🥈</span>}
                                {idx === 2 && <span className="text-xl">🥉</span>}
                                {idx > 2 && <span className="text-gray-500 font-bold w-6 text-center">#{idx + 1}</span>}
                                {u.name}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5 ml-8">{u.phone}</div>
                            </td>
                            <td className="p-4 text-center font-bold text-gray-300">{u.orderCount}</td>
                            <td className="p-4 text-right font-black text-orange-300">{u.totalSpent.toLocaleString()} ₫</td>
                          </tr>
                        )) : <tr><td colSpan="3" className="p-6 text-center text-gray-400">Chưa có dữ liệu khách hàng</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-white/10 bg-white/5">
                    <h3 className="text-lg font-black text-red-300 flex items-center gap-2">🔥 Top Sản Phẩm Bán Chạy</h3>
                    <p className="text-xs text-gray-400 mt-1">5 món ăn mang lại doanh thu cao nhất.</p>
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/5 border-b border-white/10 text-gray-400">
                        <tr>
                          <th className="p-4 font-bold">Tên món ăn</th>
                          <th className="p-4 font-bold text-center">Đã bán</th>
                          <th className="p-4 font-bold text-right">Doanh thu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {topProductsList.length > 0 ? topProductsList.map((p, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-white">{p.name}</td>
                            <td className="p-4 text-center font-black text-gray-300">{p.quantity}</td>
                            <td className="p-4 text-right font-bold text-orange-300">{p.revenue.toLocaleString()} ₫</td>
                          </tr>
                        )) : <tr><td colSpan="3" className="p-6 text-center text-gray-400">Chưa có dữ liệu món ăn</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-white">🕒 Giao Dịch Gần Nhất</h3>
                    <p className="text-xs text-gray-400 mt-1">Danh sách 5 đơn hàng vừa được đặt.</p>
                  </div>
                  <button onClick={() => setActiveTab("orders")} className="text-sm font-bold text-orange-300 hover:text-orange-200 bg-orange-500/20 border border-orange-500/30 px-4 py-2 rounded-xl transition-colors">
                    Xem tất cả &rarr;
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10 text-gray-400">
                      <tr>
                        <th className="p-4 font-bold">Mã Đơn</th>
                        <th className="p-4 font-bold">Khách hàng</th>
                        <th className="p-4 font-bold">Thời gian</th>
                        <th className="p-4 font-bold text-center">Trạng thái</th>
                        <th className="p-4 font-bold text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {recentOrders.length > 0 ? recentOrders.map(o => (
                        <tr key={o._id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold text-white">#{o._id.substring(0, 7)}</td>
                          <td className="p-4">
                            <div className="font-bold text-white">{o.customer?.fullName}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{o.paymentMethod === 'cod' ? 'Tiền mặt' : 'Online'}</div>
                          </td>
                          <td className="p-4 text-gray-300">{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
                          <td className="p-4 text-center">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">{o.status}</span>
                          </td>
                          <td className="p-4 text-right font-black text-orange-300">{o.totalAmount.toLocaleString()} ₫</td>
                        </tr>
                      )) : <tr><td colSpan="5" className="p-6 text-center text-gray-400">Chưa có giao dịch nào</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 border-b border-white/10 text-gray-400">
                  <tr>
                    <th className="p-5 font-bold uppercase tracking-wider">Mã Đơn</th>
                    <th className="p-5 font-bold uppercase tracking-wider">Khách Hàng</th>
                    <th className="p-5 font-bold uppercase tracking-wider">Món đặt</th>
                    <th className="p-5 font-bold uppercase tracking-wider text-center">Trạng Thái</th>
                    <th className="p-5 font-bold uppercase tracking-wider text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-5 font-black text-white">#{o._id.substring(0, 7)}</td>
                      <td className="p-5">
                        <div className="font-bold text-white text-base">{o.customer?.fullName || "Khách vãng lai"}</div>
                        <div className="text-orange-400 font-bold text-xs mt-0.5">{o.customer?.phone || "N/A"}</div>
                        <div className="text-xs text-gray-400 mt-1 truncate max-w-[200px]" title={o.customer?.address}>{o.customer?.address}</div>
                      </td>
                      <td className="p-5 text-gray-300">
                        <div className="font-medium">{o.items?.length || 0} món</div>
                        <div className="font-black text-orange-300 mt-0.5">{o.totalAmount?.toLocaleString()}đ</div>
                      </td>
                      <td className="p-5 text-center">
                        <select value={o.status} onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                          className="border-2 border-white/20 bg-white/5 px-4 py-2 rounded-xl text-xs font-bold outline-none cursor-pointer appearance-none text-center text-white focus:border-orange-500">
                          <option value="Chờ xác nhận" className="bg-gray-900">Chờ xác nhận</option>
                          <option value="Đang chuẩn bị" className="bg-gray-900">Đang chuẩn bị</option>
                          <option value="Đang giao" className="bg-gray-900">Đang giao</option>
                          <option value="Đã giao" className="bg-gray-900">Đã giao</option>
                          <option value="Đã hủy" className="bg-gray-900">Đã hủy</option>
                        </select>
                      </td>
                      <td className="p-5 text-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedOrder(o)} className="text-orange-300 bg-orange-500/20 hover:bg-orange-500/40 font-bold px-3 py-1.5 rounded-lg transition-colors border border-orange-500/30">Chi tiết</button>
                        <button onClick={() => handleDeleteOrder(o._id)} className="text-red-300 bg-red-500/20 hover:bg-red-500/40 font-bold px-3 py-1.5 rounded-lg transition-colors border border-red-500/30">Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "banners" && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 border-b border-white/10 text-gray-400">
                  <tr>
                    <th className="p-5 font-bold uppercase tracking-wider">Hình Ảnh Banner</th>
                    <th className="p-5 font-bold uppercase tracking-wider">Tên chiến dịch</th>
                    <th className="p-5 font-bold uppercase tracking-wider">Thời hạn hiệu lực</th>
                    <th className="p-5 font-bold uppercase tracking-wider text-center">Trạng thái</th>
                    <th className="p-5 font-bold uppercase tracking-wider text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {banners.map((b) => {
                    const now = new Date();
                    const start = new Date(b.startDate);
                    const end = new Date(b.endDate);
                    const isTimeValid = now >= start && now <= end;
                    const actuallyShowing = b.isActive && isTimeValid;

                    return (
                      <tr key={b._id} className={`transition-colors group ${!actuallyShowing ? "bg-white/5 opacity-60" : "hover:bg-white/5"}`}>
                        <td className="p-5">
                          <img 
                            src={getImageUrl(b.image)} 
                            onError={handleBannerError} 
                            alt={b.title} 
                            className="w-40 h-20 object-cover rounded-xl border border-white/20 shadow-lg" 
                          />
                        </td>
                        <td className="p-5 font-bold text-white text-base">{b.title}</td>
                        <td className="p-5">
                          <div className="text-sm font-medium text-green-400">Từ: {start.toLocaleDateString('vi-VN')}</div>
                          <div className="text-sm font-medium text-red-400 mt-1">Đến: {end.toLocaleDateString('vi-VN')}</div>
                          {!isTimeValid && <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-bold mt-2 inline-block border border-red-500/30">⏳ Hết hạn / Chưa tới giờ</span>}
                        </td>
                        <td className="p-5 text-center">
                          <button 
                            onClick={() => handleToggleBannerActive(b)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${b.isActive ? 'bg-orange-500' : 'bg-gray-600'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${b.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                          <div className={`text-xs font-bold mt-2 ${actuallyShowing ? "text-green-400" : "text-gray-400"}`}>
                            {actuallyShowing ? "Đang hiển thị" : "Đang ẩn"}
                          </div>
                        </td>
                        <td className="p-5 text-center space-x-2">
                          <button onClick={() => handleEditBannerClick(b)} className="text-orange-300 bg-orange-500/20 hover:bg-orange-500/40 font-bold px-3 py-1.5 rounded-lg transition-colors border border-orange-500/30">Sửa</button>
                          <button onClick={() => handleDeleteBanner(b._id)} className="text-red-300 bg-red-500/20 hover:bg-red-500/40 font-bold px-3 py-1.5 rounded-lg transition-colors border border-red-500/30">Xóa</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {banners.length === 0 && <div className="p-10 text-center text-gray-400 font-medium">Chưa có banner nào được upload.</div>}
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 border-b border-white/10 text-gray-400">
                  <tr>
                    <th className="p-5 font-bold uppercase tracking-wider">Tài khoản</th>
                    <th className="p-5 font-bold uppercase tracking-wider">Liên hệ</th>
                    <th className="p-5 font-bold uppercase tracking-wider">Vị trí</th>
                    <th className="p-5 font-bold uppercase tracking-wider text-center">Quyền</th>
                    <th className="p-5 font-bold uppercase tracking-wider text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-5 flex items-center gap-4">
                        <img 
                          src={getImageUrl(u.avatar)} 
                          onError={(e) => handleAvatarError(e, u.name)} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover border-2 border-white/20" 
                        />
                        <div>
                          <div className="font-bold text-white text-base">{u.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">@{u.username}</div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="text-white font-medium">{u.email}</div>
                        <div className="text-orange-400 font-bold text-xs mt-0.5">{u.phone}</div>
                      </td>
                      <td className="p-5"><span className="text-xs bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg font-medium border border-white/20">📍 {u.location || "Chưa xác định"}</span></td>
                      <td className="p-5 text-center">
                        <span className={`px-4 py-1.5 rounded-xl text-xs font-bold border ${u.role === "admin" ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-blue-500/20 text-blue-300 border-blue-500/30"}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-5 text-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditUserClick(u)} className="text-orange-300 bg-orange-500/20 hover:bg-orange-500/40 font-bold px-3 py-1.5 rounded-lg transition-colors border border-orange-500/30">Sửa</button>
                        {u.role !== "admin" && (
                          <button onClick={() => handleDeleteUser(u._id)} className="text-red-300 bg-red-500/20 hover:bg-red-500/40 font-bold px-3 py-1.5 rounded-lg transition-colors border border-red-500/30">Xóa</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "products" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <div key={p._id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 shadow-2xl hover:shadow-orange-500/20 transition-all group">
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4 bg-white/5">
                    <img 
                      src={getImageUrl(p.image)} 
                      onError={handleImageError} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt="" 
                    />
                    <span className="absolute top-3 left-3 bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-white/30">{p.category}</span>
                  </div>
                  <h3 className="font-bold text-white text-lg truncate">{p.name}</h3>
                  <p className="text-orange-300 font-black text-xl mt-1">{Number(p.price).toLocaleString()}đ</p>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button onClick={() => handleEditProduct(p)} className="bg-orange-500/20 hover:bg-orange-500/40 text-orange-300 font-bold py-2 rounded-xl transition-colors border border-orange-500/30">Sửa</button>
                    <button onClick={() => handleDeleteProduct(p._id)} className="bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold py-2 rounded-xl transition-colors border border-red-500/30">Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "chat" && (
            <div className="h-[75vh] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex overflow-hidden">
              <div className="w-1/3 border-r border-white/10 bg-white/5 flex flex-col">
                <div className="p-5 font-black text-white border-b border-white/10 bg-white/5">Khách hàng cần hỗ trợ</div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {Object.keys(clients).length === 0 ? <p className="text-center text-gray-400 text-sm mt-10">Trống</p> : 
                    Object.keys(clients).map((clientId) => (
                      <button key={clientId} onClick={() => setActiveClient(clientId)}
                        className={`w-full text-left p-4 rounded-2xl transition-all border ${activeClient === clientId ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg border-orange-500" : "bg-white/5 text-gray-300 hover:bg-white/10 border-white/20"}`}>
                        <p className="font-bold">{clients[clientId].name}</p>
                        <p className={`text-xs truncate mt-1 ${activeClient === clientId ? "text-white/80" : "text-gray-400"}`}>{clients[clientId].messages.slice(-1)[0]?.text}</p>
                      </button>
                    ))}
                </div>
              </div>

              <div className="w-2/3 flex flex-col bg-white/5">
                {activeClient ? (
                  <>
                    <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5 shadow-lg z-10">
                      <div>
                        <span className="font-black text-white text-lg">{clients[activeClient].name}</span>
                        <span className="flex items-center gap-2 text-xs text-green-400 font-bold mt-1"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> Đang Online</span>
                      </div>
                      <button onClick={handleClearChat} className="bg-red-500/20 text-red-300 hover:bg-red-500/40 text-sm font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 border border-red-500/30">
                        <span>🗑️</span> Xóa hội thoại
                      </button>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-white/5">
                      {clients[activeClient].messages.map((msg, idx) => (
                        <div key={idx} className={`p-4 max-w-[70%] text-sm shadow-lg ${msg.sender === "admin" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white self-end rounded-2xl rounded-tr-sm" : "bg-white/10 border border-white/20 text-gray-200 self-start rounded-2xl rounded-tl-sm"}`}>
                          {msg.text}
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleSendReply} className="p-4 bg-white/5 border-t border-white/10 flex gap-3">
                      <input type="text" value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-2xl px-5 py-3.5 outline-none focus:border-orange-500 focus:bg-white/20 transition-all" />
                      <button type="submit" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:from-orange-600 hover:to-red-700 transition-all shadow-lg">Gửi</button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 font-medium bg-white/5">
                    <span className="text-6xl mb-4 opacity-20">💬</span>
                    Chọn một hội thoại bên trái để bắt đầu
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
           <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto border border-white/20">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/10 text-gray-300 hover:bg-red-500/30 hover:text-red-300 rounded-full font-bold flex items-center justify-center transition-all border border-white/20">✕</button>
              <h2 className="text-2xl font-black mb-6 text-white border-b border-white/10 pb-4">Chi Tiết Đơn <span className="text-orange-300">#{selectedOrder._id.substring(0, 8)}</span></h2>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Khách hàng</h3>
                  <p className="font-bold text-white text-lg">{selectedOrder.customer?.fullName}</p>
                  <p className="text-orange-400 font-bold mt-1">📞 {selectedOrder.customer?.phone}</p>
                  <p className="text-sm text-gray-300 mt-2 font-medium">📍 {selectedOrder.customer?.address}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Thông tin chung</h3>
                  <p className="text-sm font-medium mb-2">Thanh toán: <span className="font-bold text-white">{selectedOrder.paymentMethod === 'cod' ? 'Tiền mặt (COD)' : 'Online'}</span></p>
                  <p className="text-sm font-medium mb-4">Ngày đặt: <span className="font-bold text-white">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</span></p>
                  <span className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">{selectedOrder.status}</span>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6 shadow-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 border-b border-white/10"><tr><th className="p-4 font-bold text-white">Món ăn</th><th className="p-4 text-center font-bold text-white">SL</th><th className="p-4 text-right font-bold text-white">Đơn giá</th></tr></thead>
                  <tbody className="divide-y divide-white/10">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}><td className="p-4 font-bold text-white">{item.name}</td><td className="p-4 text-center font-black text-gray-300">x{item.quantity}</td><td className="p-4 text-right text-gray-300 font-medium">{(item.price).toLocaleString()}đ</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-6">
                <span className="text-lg font-bold text-gray-300">TỔNG THU:</span>
                <span className="text-3xl font-black text-orange-300">{selectedOrder.totalAmount?.toLocaleString()} đ</span>
              </div>
           </div>
        </div>
      )}

      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
           <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative border border-white/20">
              <button onClick={() => setIsUserModalOpen(false)} className="absolute top-6 right-6 w-10 h-10 bg-white/10 text-gray-300 hover:bg-red-500/30 hover:text-red-300 rounded-full font-bold flex items-center justify-center transition-all border border-white/20">✕</button>
              <h2 className="text-2xl font-black mb-6 text-white">Sửa Tài Khoản</h2>
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div><label className="text-xs font-bold text-gray-300 uppercase ml-2 mb-1 block">Tên hiển thị</label><input type="text" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} className="w-full bg-white/5 border-2 border-white/20 focus:bg-white/10 focus:border-orange-500 rounded-xl p-3 outline-none transition-all font-medium text-white placeholder-gray-400" /></div>
                <div><label className="text-xs font-bold text-gray-300 uppercase ml-2 mb-1 block">Email</label><input type="email" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} className="w-full bg-white/5 border-2 border-white/20 focus:bg-white/10 focus:border-orange-500 rounded-xl p-3 outline-none transition-all font-medium text-white placeholder-gray-400" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-gray-300 uppercase ml-2 mb-1 block">Số điện thoại</label><input type="text" value={userFormData.phone} onChange={e => setUserFormData({...userFormData, phone: e.target.value})} className="w-full bg-white/5 border-2 border-white/20 focus:bg-white/10 focus:border-orange-500 rounded-xl p-3 outline-none transition-all font-medium text-white placeholder-gray-400" /></div>
                  <div><label className="text-xs font-bold text-gray-300 uppercase ml-2 mb-1 block">Cấp quyền</label><select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value})} className="w-full bg-white/5 border-2 border-white/20 focus:bg-white/10 focus:border-orange-500 rounded-xl p-3 outline-none transition-all font-bold text-white"><option value="user" className="bg-gray-900">USER</option><option value="admin" className="bg-gray-900">ADMIN</option></select></div>
                </div>
                <div><label className="text-xs font-bold text-red-400 uppercase ml-2 mb-1 block">Reset Mật khẩu (Bỏ trống nếu không đổi)</label><input type="password" placeholder="Nhập mật khẩu mới..." value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} className="w-full bg-red-500/10 border-2 border-red-500/30 focus:bg-red-500/20 focus:border-red-500 rounded-xl p-3 outline-none transition-all placeholder:text-red-400 text-red-300 font-bold" /></div>
                <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 hover:shadow-lg hover:shadow-orange-500/30 text-white font-black py-4 rounded-xl mt-4 transition-all hover:-translate-y-0.5">Lưu Thông Tin</button>
              </form>
           </div>
        </div>
      )}

      {isBannerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
           <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] w-full max-w-lg shadow-2xl relative border border-white/20">
              <button onClick={() => setIsBannerModalOpen(false)} className="absolute top-6 right-6 w-10 h-10 bg-white/10 text-gray-300 hover:bg-red-500/30 hover:text-red-300 rounded-full font-bold flex items-center justify-center transition-all border border-white/20">✕</button>
              <h2 className="text-2xl font-black mb-6 text-white">{editBannerId ? "Sửa Banner" : "Upload Banner Mới"}</h2>
              <form onSubmit={handleSaveBanner} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase ml-2 mb-1 block">Tên chiến dịch/Banner</label>
                  <input required type="text" value={bannerFormData.title} onChange={e => setBannerFormData({...bannerFormData, title: e.target.value})} className="w-full bg-white/5 border-2 border-white/20 focus:bg-white/10 focus:border-orange-500 rounded-xl p-3 outline-none transition-all font-medium text-white placeholder-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-green-400 uppercase ml-2 mb-1 block">Ngày Bắt Đầu</label>
                    <input required type="date" value={bannerFormData.startDate} onChange={e => setBannerFormData({...bannerFormData, startDate: e.target.value})} className="w-full bg-green-500/10 text-green-300 border-2 border-green-500/30 focus:bg-green-500/20 focus:border-green-500 rounded-xl p-3 outline-none transition-all font-bold" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-red-400 uppercase ml-2 mb-1 block">Ngày Kết Thúc</label>
                    <input required type="date" value={bannerFormData.endDate} onChange={e => setBannerFormData({...bannerFormData, endDate: e.target.value})} className="w-full bg-red-500/10 text-red-300 border-2 border-red-500/30 focus:bg-red-500/20 focus:border-red-500 rounded-xl p-3 outline-none transition-all font-bold" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase ml-2 mb-1 block">Nhập Link Ảnh (URL)</label>
                  <input required type="text" placeholder="https://..." value={bannerFormData.image || ""} onChange={e => setBannerFormData({...bannerFormData, image: e.target.value})} className="w-full bg-white/5 border-2 border-white/20 focus:bg-white/10 focus:border-orange-500 rounded-xl p-3 outline-none transition-all font-medium text-white placeholder-gray-400" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer p-4 border border-white/20 rounded-xl hover:bg-white/5 transition-colors">
                  <input type="checkbox" checked={bannerFormData.isActive} onChange={e => setBannerFormData({...bannerFormData, isActive: e.target.checked})} className="w-5 h-5 text-orange-500 border border-white/20 rounded focus:ring-orange-500 bg-white/5" />
                  <span className="font-bold text-white">Kích hoạt hiển thị Banner này</span>
                </label>
                <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 hover:shadow-lg hover:shadow-orange-500/30 text-white font-black py-4 rounded-xl mt-2 transition-all hover:-translate-y-0.5">Lưu Banner</button>
              </form>
           </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
           <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] w-full max-w-lg shadow-2xl relative border border-white/20">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 w-10 h-10 bg-white/10 text-gray-300 hover:bg-red-500/30 hover:text-red-300 rounded-full font-bold flex items-center justify-center transition-all border border-white/20">✕</button>
              <h2 className="text-2xl font-black mb-6 text-white">{editId ? "Sửa Món Ăn" : "Thêm Món Mới"}</h2>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <input required placeholder="Tên món" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 focus:bg-white/10 border-2 border-white/20 focus:border-orange-500 p-3 rounded-xl outline-none transition-all font-medium text-white placeholder-gray-400" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="number" placeholder="Giá (đ)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-white/5 focus:bg-white/10 border-2 border-white/20 focus:border-orange-500 p-3 rounded-xl outline-none transition-all font-medium text-white placeholder-gray-400" />
                  <input required type="number" placeholder="Calories" value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})} className="w-full bg-white/5 focus:bg-white/10 border-2 border-white/20 focus:border-orange-500 p-3 rounded-xl outline-none transition-all font-medium text-white placeholder-gray-400" />
                </div>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 focus:bg-white/10 border-2 border-white/20 focus:border-orange-500 p-3 rounded-xl outline-none transition-all font-bold text-white">
                  {["Hamburger", "Pizza", "Gà Rán", "Cơm", "Nước Uống", "Combo"].map(cat => <option key={cat} value={cat} className="bg-gray-900">{cat}</option>)}
                </select>
                <input required type="text" placeholder="Nhập Link ảnh (URL)..." value={formData.image || ""} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-white/5 focus:bg-white/10 border-2 border-white/20 focus:border-orange-500 p-3 rounded-xl outline-none transition-all font-medium text-white placeholder-gray-400" />
                
                <textarea required placeholder="Mô tả món ăn..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 focus:bg-white/10 border-2 border-white/20 focus:border-orange-500 p-3 rounded-xl outline-none transition-all font-medium text-white placeholder-gray-400 min-h-[100px]"></textarea>
                <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black py-4 rounded-xl mt-4 transition-all shadow-lg hover:-translate-y-0.5">Lưu Sản Phẩm</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}