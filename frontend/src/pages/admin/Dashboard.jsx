import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Link, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { SERVER_URL } from "../../config";

// Socket
const socket = io(SERVER_URL);

export default function Dashboard() {
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]); 
  const [banners, setBanners] = useState([]);
  const [tableOrders, setTableOrders] = useState([]); // Quản lý danh sách đơn đặt bàn
  const [restaurantTables, setRestaurantTables] = useState([]); // 👉 Thêm State quản lý sơ đồ bàn
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
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

  // Config
  const API_URL = `${SERVER_URL}/api/products`;
  const USER_API_URL = `${SERVER_URL}/api/auth/users`;
  const ORDER_API_URL = `${SERVER_URL}/api/orders`; 
  const BANNER_API_URL = `${SERVER_URL}/api/banners`;
  const TABLE_ORDER_API_URL = `${SERVER_URL}/api/table-orders`; 

  const getAuthHeader = () => {
    return { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
  };

  // Lifecycle
  useEffect(() => {
    fetchProducts();
    fetchUsers();
    fetchOrders();
    fetchBanners();
    fetchTableOrders();
    fetchRestaurantTables(); // 👉 Fetch sơ đồ bàn khi load trang

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

  // Fetch Methods
  const fetchProducts = async () => { try { const res = await axios.get(API_URL); setProducts(res.data); } catch (e) {} };
  const fetchUsers = async () => { try { const res = await axios.get(USER_API_URL, getAuthHeader()); setUsers(res.data); } catch (e) {} };
  const fetchOrders = async () => { try { const res = await axios.get(ORDER_API_URL, getAuthHeader()); setOrders(res.data); } catch (e) {} };
  const fetchBanners = async () => { try { const res = await axios.get(BANNER_API_URL, getAuthHeader()); setBanners(res.data); } catch (e) {} };
  const fetchTableOrders = async () => { try { const res = await axios.get(TABLE_ORDER_API_URL, getAuthHeader()); setTableOrders(res.data); } catch (e) {} };
  
  // 👉 Fetch danh sách 20 bàn
  const fetchRestaurantTables = async () => {
    try { 
      const res = await axios.get(`${SERVER_URL}/api/tables`); 
      setRestaurantTables(res.data); 
    } catch(e){}
  };

  // Order Handlers
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${ORDER_API_URL}/${orderId}/status`, { status: newStatus }, getAuthHeader());
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (e) { alert("Lỗi cập nhật trạng thái!"); }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Xác nhận xóa đơn hàng?")) {
      try {
        await axios.delete(`${ORDER_API_URL}/${orderId}`, getAuthHeader());
        setOrders(orders.filter(o => o._id !== orderId));
        setSelectedOrder(null); 
      } catch (e) { alert("Lỗi xóa đơn hàng."); }
    }
  };

  // 👉 Table Order Handlers (Xử lý đặt bàn & Sơ đồ)
  const handleUpdateTableOrderStatus = async (id, newStatus) => {
    try {
      await axios.put(`${TABLE_ORDER_API_URL}/${id}/status`, { status: newStatus }, getAuthHeader());
      setTableOrders(tableOrders.map(t => t._id === id ? { ...t, status: newStatus } : t));
    } catch (e) { alert("Lỗi cập nhật trạng thái đặt bàn!"); }
  };

  // 👉 Cập nhật Xanh/Đỏ khi Admin click vào bàn
  const handleToggleTable = async (tableId) => {
    try {
      const res = await axios.put(`${SERVER_URL}/api/tables/${tableId}/toggle`, {}, getAuthHeader());
      setRestaurantTables(restaurantTables.map(t => t._id === tableId ? res.data : t));
    } catch (e) { alert("Lỗi cập nhật bàn"); }
  };

  // Product Handlers
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
      const config = getAuthHeader(); 
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
    if (window.confirm("Xác nhận xóa sản phẩm?")) { 
      await axios.delete(`${API_URL}/${id}`, getAuthHeader()); 
      setProducts(products.filter(p => p._id !== id)); 
    } 
  };

  // User Handlers
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
    } catch (e) { alert("Lỗi cập nhật người dùng"); }
  };

  const handleDeleteUser = async (id) => { 
    if (window.confirm("Xác nhận xóa tài khoản?")) { 
      await axios.delete(`${USER_API_URL}/${id}`, getAuthHeader()); 
      setUsers(users.filter(u => u._id !== id)); 
    } 
  };

  // Banner Handlers
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
    } catch (e) { alert("Lỗi lưu banner"); }
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm("Xác nhận xóa banner?")) {
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

  // Chat Handlers
  const handleClearChat = () => {
    if(!activeClient) return;
    if(window.confirm("Xác nhận xóa lịch sử hội thoại?")) {
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Utils
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

  // Analytics Data
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

  // Render
  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 flex font-sans">
      
      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gray-900 lg:bg-white/5 lg:backdrop-blur-xl border-r border-white/10 text-white p-6 shadow-2xl flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center justify-between mb-10 mt-4 relative">
          <div className="flex w-full items-center justify-center">
            <img src="/img/MTK.png" alt="MTK FastFood Logo" className="w-48 h-auto object-contain drop-shadow-2xl" />
          </div>
          <button className="lg:hidden absolute -right-2 top-0 text-gray-400 hover:text-white p-2" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <nav className="space-y-3 flex-1 overflow-y-auto pr-2">
          {[
            { id: "overview", icon: "📊", label: "Tổng quan" },
            { id: "orders", icon: "🛒", label: "Đơn hàng" },
            { id: "tables", icon: "🍽️", label: "Đặt bàn" },
            { id: "products", icon: "🍔", label: "Sản phẩm" },
            { id: "banners", icon: "🖼️", label: "Banner" },
            { id: "users", icon: "👥", label: "Khách hàng" },
            { id: "chat", icon: "💬", label: "CSKH" }
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto flex flex-col h-screen relative">
        
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl px-4 lg:px-10 py-4 lg:py-6 border-b border-white/10 shadow-xl flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-white bg-white/5 p-2 rounded-lg border border-white/10" onClick={() => setIsMobileMenuOpen(true)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
            <div>
              <h1 className="text-xl lg:text-2xl font-black text-white truncate">
                {activeTab === "overview" && "Tổng quan"}
                {activeTab === "orders" && "Quản lý đơn hàng"}
                {activeTab === "tables" && "Quản lý đặt bàn"}
                {activeTab === "products" && "Kho sản phẩm"}
                {activeTab === "banners" && "Danh sách banner"}
                {activeTab === "users" && "Thông tin khách hàng"}
                {activeTab === "chat" && "Trung tâm CSKH"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {activeTab === "products" && (
              <button onClick={() => { setEditId(null); setFormData({ name: "", category: "Hamburger", price: "", description: "", calories: "", image: "" }); setIsModalOpen(true); }} 
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl font-bold shadow-lg transition-colors text-sm lg:text-base">
                Thêm món
              </button>
            )}
            {activeTab === "banners" && (
              <button onClick={() => { setEditBannerId(null); setBannerFormData({ title: "", startDate: "", endDate: "", isActive: true, image: "" }); setIsBannerModalOpen(true); }} 
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl font-bold shadow-lg transition-colors text-sm lg:text-base">
                Thêm banner
              </button>
            )}
            
            <div className="hidden sm:block w-px h-6 bg-white/20 mx-2"></div>
            
            <Link to="/" className="hidden sm:block text-gray-300 hover:text-white font-bold text-sm transition-colors">Về Website</Link>
            <button onClick={handleLogout} className="bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-300 border border-red-500/30 px-4 py-2 rounded-xl font-bold text-sm transition-colors">Đăng xuất</button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 lg:p-10 max-w-7xl mx-auto w-full flex-1">
          
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6 lg:space-y-8 pb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-white shadow-2xl">
                  <h3 className="text-gray-300 font-bold mb-2 text-sm uppercase">Doanh Thu</h3>
                  <p className="text-3xl lg:text-4xl font-black text-orange-400">{totalRevenue.toLocaleString()} ₫</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-white shadow-2xl">
                  <h3 className="text-gray-300 font-bold mb-2 text-sm uppercase">Đơn Hàng</h3>
                  <p className="text-3xl lg:text-4xl font-black text-blue-400">{totalOrdersCount}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-white shadow-2xl sm:col-span-2 lg:col-span-1">
                  <h3 className="text-gray-300 font-bold mb-2 text-sm uppercase">Khách Hàng</h3>
                  <p className="text-3xl lg:text-4xl font-black text-green-400">{totalUsersCount}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-4 lg:p-6 w-full">
                  <h3 className="text-base font-bold text-white mb-6 uppercase">Doanh thu 7 ngày</h3>
                  <div className="h-[250px] lg:h-[300px] w-full -ml-4 lg:ml-0">
                    {revenueChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueChartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} width={60} tickFormatter={(value) => value.toLocaleString()} />
                          <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(15,23,42,0.9)'}} />
                          <Bar dataKey="revenue" fill="#F97316" radius={[6, 6, 6, 6]} barSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <div className="w-full h-full flex items-center justify-center text-gray-400 italic">Chưa có dữ liệu</div>}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-4 lg:p-6 flex flex-col">
                  <h3 className="text-base font-bold text-white mb-2 uppercase">Trạng thái đơn hàng</h3>
                  <div className="flex-1 min-h-[250px] w-full">
                    {orderStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                            {orderStatusData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: 'rgba(15,23,42,0.9)'}} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div className="w-full h-full flex items-center justify-center text-gray-400 italic">Chưa có dữ liệu</div>}
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {orderStatusData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-1.5 text-[11px] lg:text-xs font-medium text-gray-300">
                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                        {entry.name} ({entry.value})
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                  <div className="p-4 lg:p-6 border-b border-white/10 bg-white/5">
                    <h3 className="text-base font-bold text-white uppercase">Khách hàng chi tiêu cao</h3>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs lg:text-sm whitespace-nowrap">
                      <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-xs">
                        <tr>
                          <th className="p-3 lg:p-4 font-bold">Khách hàng</th>
                          <th className="p-3 lg:p-4 font-bold text-center">Số đơn</th>
                          <th className="p-3 lg:p-4 font-bold text-right">Chi tiêu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {topUsersList.map((u, idx) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="p-3 lg:p-4">
                              <div className="font-bold text-white flex items-center gap-2">
                                <span className="text-gray-400 w-4">{idx + 1}.</span> {u.name}
                              </div>
                              <div className="text-gray-400 mt-1 ml-6">{u.phone}</div>
                            </td>
                            <td className="p-3 lg:p-4 text-center text-gray-300">{u.orderCount}</td>
                            <td className="p-3 lg:p-4 text-right font-black text-orange-400">{u.totalSpent.toLocaleString()} ₫</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                  <div className="p-4 lg:p-6 border-b border-white/10 bg-white/5">
                    <h3 className="text-base font-bold text-white uppercase">Sản phẩm bán chạy</h3>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs lg:text-sm whitespace-nowrap">
                      <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-xs">
                        <tr>
                          <th className="p-3 lg:p-4 font-bold">Sản phẩm</th>
                          <th className="p-3 lg:p-4 font-bold text-center">Đã bán</th>
                          <th className="p-3 lg:p-4 font-bold text-right">Doanh thu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {topProductsList.map((p, idx) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="p-3 lg:p-4 font-bold text-white truncate max-w-[150px]">
                              <span className="text-gray-400 w-4 inline-block">{idx + 1}.</span> {p.name}
                            </td>
                            <td className="p-3 lg:p-4 text-center font-bold text-gray-300">{p.quantity}</td>
                            <td className="p-3 lg:p-4 text-right font-bold text-orange-400">{p.revenue.toLocaleString()} ₫</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="p-4 font-bold">Mã Đơn</th>
                      <th className="p-4 font-bold">Khách Hàng</th>
                      <th className="p-4 font-bold">Món Đặt</th>
                      <th className="p-4 font-bold text-center">Trạng Thái</th>
                      <th className="p-4 font-bold text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-white/5">
                        <td className="p-4 font-bold text-white">#{o._id.substring(0, 7)}</td>
                        <td className="p-4">
                          <div className="font-bold text-white">{o.customer?.fullName || "N/A"}</div>
                          <div className="text-gray-400 text-xs mt-1">{o.customer?.phone || "N/A"}</div>
                        </td>
                        <td className="p-4 text-gray-300">
                          <div>{o.items?.length || 0} món</div>
                          <div className="font-bold text-orange-400 mt-1">{o.totalAmount?.toLocaleString()} đ</div>
                        </td>
                        <td className="p-4 text-center">
                          <select value={o.status} onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                            className="border border-white/20 bg-white/5 px-2 py-1.5 rounded-lg text-xs font-medium outline-none cursor-pointer text-white focus:border-orange-500">
                            <option value="Chờ xác nhận" className="bg-gray-900">Chờ xác nhận</option>
                            <option value="Đang chuẩn bị" className="bg-gray-900">Đang chuẩn bị</option>
                            <option value="Đang giao" className="bg-gray-900">Đang giao</option>
                            <option value="Đã giao" className="bg-gray-900">Đã giao</option>
                            <option value="Đã hủy" className="bg-gray-900">Đã hủy</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => setSelectedOrder(o)} className="text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg font-medium transition-colors">Chi tiết</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 👉 Table Orders (Quản lý đặt bàn & Sơ đồ ghế) */}
          {activeTab === "tables" && (
            <div className="space-y-6">
              
              {/* SƠ ĐỒ ĐIỀU KHIỂN BÀN */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-white font-bold uppercase">Sơ đồ điều khiển (Click để Đóng/Mở bàn)</h3>
                  <div className="flex gap-4 text-xs font-bold text-gray-300">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500/20 border border-green-500"></div> Trống</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500 border border-red-400"></div> Đã đặt</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                  {restaurantTables.map(t => (
                    <button 
                      key={t._id} onClick={() => handleToggleTable(t._id)}
                      className={`aspect-square rounded-xl font-black text-sm transition-all ${
                        t.isBooked 
                          ? 'bg-red-500 border border-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                          : 'bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/30 hover:scale-105'
                      }`}
                    >
                      {t.tableNumber}
                    </button>
                  ))}
                </div>
              </div>

              {/* DANH SÁCH ĐƠN ĐẶT BÀN */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden w-full">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-xs">
                      <tr>
                        <th className="p-4 font-bold">Khách Hàng</th>
                        <th className="p-4 font-bold">Bàn Số</th>
                        <th className="p-4 font-bold">Thời Gian</th>
                        <th className="p-4 font-bold text-center">Số Người</th>
                        <th className="p-4 font-bold">Ghi Chú</th>
                        <th className="p-4 font-bold text-center">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {tableOrders.length === 0 ? (
                        <tr><td colSpan="6" className="p-8 text-center text-gray-400 italic">Chưa có dữ liệu đặt bàn</td></tr>
                      ) : (
                        tableOrders.map((t) => (
                          <tr key={t._id} className="hover:bg-white/5">
                            <td className="p-4">
                              <div className="font-bold text-white">{t.name}</div>
                              <div className="text-gray-400 text-xs mt-1">{t.phone}</div>
                            </td>
                            <td className="p-4 font-black text-orange-400 text-lg">
                              #{t.tableNumber || "-"}
                            </td>
                            <td className="p-4">
                              <div className="text-white font-medium text-base">{t.time}</div>
                              <div className="text-orange-400 text-xs font-bold mt-1">{new Date(t.date).toLocaleDateString('vi-VN')}</div>
                            </td>
                            <td className="p-4 text-center font-black text-white">{t.guests}</td>
                            <td className="p-4 text-gray-300 max-w-[150px] truncate" title={t.note}>{t.note || "-"}</td>
                            <td className="p-4 text-center">
                              <select
                                value={t.status}
                                onChange={(e) => handleUpdateTableOrderStatus(t._id, e.target.value)}
                                className={`border border-white/20 px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer focus:border-white/50 transition-colors
                                  ${t.status === 'Chờ xác nhận' ? 'bg-yellow-500/20 text-yellow-400' :
                                    t.status === 'Đã xác nhận' ? 'bg-green-500/20 text-green-400' :
                                    'bg-red-500/20 text-red-400'}
                                `}
                              >
                                <option value="Chờ xác nhận" className="bg-gray-900 text-white">Chờ xác nhận</option>
                                <option value="Đã xác nhận" className="bg-gray-900 text-white">Đã xác nhận</option>
                                <option value="Đã hủy" className="bg-gray-900 text-white">Đã hủy</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Banners */}
          {activeTab === "banners" && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden w-full">
               <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-xs">
                      <tr>
                        <th className="p-4 font-bold">Hình Ảnh</th>
                        <th className="p-4 font-bold">Tiêu Đề</th>
                        <th className="p-4 font-bold">Thời Gian</th>
                        <th className="p-4 font-bold text-center">Hiển Thị</th>
                        <th className="p-4 font-bold text-center">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {banners.map((b) => {
                        const now = new Date();
                        const start = new Date(b.startDate);
                        const end = new Date(b.endDate);
                        const actuallyShowing = b.isActive && (now >= start && now <= end);

                        return (
                          <tr key={b._id} className={!actuallyShowing ? "opacity-50" : ""}>
                            <td className="p-4">
                              <img src={getImageUrl(b.image)} onError={handleBannerError} className="w-24 h-12 lg:w-32 lg:h-16 object-cover rounded-lg border border-white/10" alt=""/>
                            </td>
                            <td className="p-4 font-bold text-white">{b.title}</td>
                            <td className="p-4 text-xs">
                              <div className="text-gray-300">T: {start.toLocaleDateString('vi-VN')}</div>
                              <div className="text-gray-300 mt-1">Đ: {end.toLocaleDateString('vi-VN')}</div>
                            </td>
                            <td className="p-4 text-center">
                              <button onClick={() => handleToggleBannerActive(b)} className={`relative inline-flex h-6 w-11 rounded-full ${b.isActive ? 'bg-orange-500' : 'bg-gray-600'}`}>
                                <span className={`inline-block h-4 w-4 bg-white rounded-full mt-1 transition-transform ${b.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                              </button>
                            </td>
                            <td className="p-4 text-center">
                              <button onClick={() => handleEditBannerClick(b)} className="text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg font-medium transition-colors">Sửa</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="p-4 font-bold">Tài Khoản</th>
                      <th className="p-4 font-bold">Liên Hệ</th>
                      <th className="p-4 font-bold text-center">Phân Quyền</th>
                      <th className="p-4 font-bold text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-white/5">
                        <td className="p-4 flex items-center gap-3">
                          <img src={getImageUrl(u.avatar)} onError={(e) => handleAvatarError(e, u.name)} className="w-8 h-8 rounded-full border border-white/10" alt=""/>
                          <div>
                            <div className="font-bold text-white">{u.name}</div>
                            <div className="text-xs text-gray-400">@{u.username}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-white">{u.email}</div>
                          <div className="text-gray-400 text-xs mt-1">{u.phone}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${u.role === "admin" ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-blue-500/20 text-blue-300 border-blue-500/30"}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleEditUserClick(u)} className="text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg font-medium transition-colors">Sửa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products */}
          {activeTab === "products" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 pb-10">
              {products.map((p) => (
                <div key={p._id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 shadow-2xl flex flex-col hover:bg-white/15 transition-colors">
                  <div className="relative w-full h-40 lg:h-48 rounded-2xl overflow-hidden mb-4 border border-white/10">
                    <img src={getImageUrl(p.image)} onError={handleImageError} className="w-full h-full object-cover" alt="" />
                    <span className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white px-2 py-1 rounded-lg text-[10px] font-bold uppercase">{p.category}</span>
                  </div>
                  <h3 className="font-bold text-white text-base lg:text-lg truncate">{p.name}</h3>
                  <p className="text-orange-400 font-bold text-lg mt-1">{Number(p.price).toLocaleString()} ₫</p>
                  <div className="grid grid-cols-2 gap-2 mt-auto pt-4">
                    <button onClick={() => handleEditProduct(p)} className="bg-white/10 text-white font-medium py-2 rounded-xl text-sm border border-white/20 hover:bg-white/20 transition-colors">Sửa</button>
                    <button onClick={() => handleDeleteProduct(p._id)} className="bg-red-500/20 text-red-400 font-medium py-2 rounded-xl text-sm border border-red-500/30 hover:bg-red-500/40 transition-colors">Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chat */}
          {activeTab === "chat" && (
            <div className="h-[75vh] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex overflow-hidden relative">
              <div className={`${activeClient ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/3 border-r border-white/10 bg-white/5 flex-col absolute lg:static inset-0 z-10`}>
                <div className="p-4 lg:p-5 font-bold text-white border-b border-white/10 uppercase text-sm">Danh sách</div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {Object.keys(clients).length === 0 ? <p className="text-center text-gray-400 text-sm mt-10">Trống</p> : 
                    Object.keys(clients).map((clientId) => (
                      <button key={clientId} onClick={() => setActiveClient(clientId)}
                        className={`w-full text-left p-4 rounded-2xl transition-all border ${activeClient === clientId ? "bg-white/10 text-white border-white/20 shadow-lg" : "bg-transparent text-gray-400 hover:bg-white/5 border-transparent"}`}>
                        <p className="font-bold text-white">{clients[clientId].name}</p>
                        <p className="text-xs truncate mt-1">{clients[clientId].messages.slice(-1)[0]?.text}</p>
                      </button>
                    ))}
                </div>
              </div>

              <div className={`${!activeClient ? 'hidden lg:flex' : 'flex'} w-full lg:w-2/3 flex-col bg-transparent absolute lg:static inset-0 z-20`}>
                {activeClient ? (
                  <>
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                      <div className="flex items-center gap-3">
                        <button className="lg:hidden text-white bg-white/10 p-2 rounded-lg border border-white/20" onClick={() => setActiveClient(null)}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div>
                          <div className="font-bold text-white">{clients[activeClient].name}</div>
                          <div className="text-xs text-green-400">Đang Online</div>
                        </div>
                      </div>
                      <button onClick={handleClearChat} className="bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-3 py-1.5 rounded-lg font-bold">Xóa</button>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                      {clients[activeClient].messages.map((msg, idx) => (
                        <div key={idx} className={`p-3 max-w-[85%] lg:max-w-[70%] text-sm rounded-2xl border ${msg.sender === "admin" ? "bg-white/10 border-white/20 text-white self-end rounded-tr-sm" : "bg-transparent border-white/10 text-gray-300 self-start rounded-tl-sm"}`}>
                          {msg.text}
                        </div>
                      ))}
                    </div>
                    
                    <form onSubmit={handleSendReply} className="p-3 bg-white/5 border-t border-white/10 flex gap-2">
                      <input type="text" value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 outline-none focus:border-white/30" />
                      <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-600 transition-colors">Gửi</button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm">
                    Chọn luồng tin nhắn
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
           <div className="bg-white/10 backdrop-blur-xl p-6 lg:p-8 rounded-3xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto border border-white/20">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20">✕</button>
              <h2 className="text-xl lg:text-2xl font-bold mb-4 text-white border-b border-white/10 pb-4">Đơn hàng #{selectedOrder._id.substring(0, 8)}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                 <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                   <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase">Khách hàng</h3>
                   <p className="font-bold text-white">{selectedOrder.customer?.fullName}</p>
                   <p className="text-gray-300 text-sm mt-1">{selectedOrder.customer?.phone}</p>
                 </div>
                 <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                   <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase">Thông tin</h3>
                   <p className="text-sm text-white mb-2">{selectedOrder.paymentMethod === 'cod' ? 'Tiền mặt' : 'Online'}</p>
                   <span className="px-3 py-1 rounded-lg text-xs font-medium border border-white/20 text-white">{selectedOrder.status}</span>
                 </div>
              </div>
              <div className="overflow-x-auto border border-white/10 rounded-xl">
                <table className="w-full text-left text-xs lg:text-sm whitespace-nowrap">
                  <thead className="bg-white/5 border-b border-white/10"><tr><th className="p-3 text-white">Sản phẩm</th><th className="p-3 text-center text-white">SL</th><th className="p-3 text-right text-white">Đơn giá</th></tr></thead>
                  <tbody>
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx} className="border-b border-white/5 last:border-0"><td className="p-3 text-white font-medium">{item.name}</td><td className="p-3 text-center text-gray-300">x{item.quantity}</td><td className="p-3 text-right text-gray-300">{(item.price).toLocaleString()} ₫</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
           <div className="bg-gray-900 lg:bg-white/10 backdrop-blur-xl p-6 rounded-3xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto border border-white/20">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 text-white rounded-full flex items-center justify-center bg-white/10 border border-white/20 hover:bg-white/20">✕</button>
              <h2 className="text-xl font-bold mb-4 text-white">{editId ? "Sửa Sản Phẩm" : "Thêm Sản Phẩm"}</h2>
              <form onSubmit={handleSaveProduct} className="space-y-3">
                <input required placeholder="Tên sản phẩm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-white/40" />
                <div className="grid grid-cols-2 gap-3">
                  <input required type="number" placeholder="Giá (đ)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-white/5 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-white/40" />
                  <input required type="number" placeholder="Calories" value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})} className="w-full bg-white/5 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-white/40" />
                </div>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-white/40">
                  {["Hamburger", "Pizza", "Gà Rán", "Cơm", "Nước Uống", "Combo"].map(cat => <option key={cat} value={cat} className="bg-gray-900">{cat}</option>)}
                </select>
                <input required type="text" placeholder="URL hình ảnh" value={formData.image || ""} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-white/5 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-white/40" />
                <textarea required placeholder="Mô tả chi tiết" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-white/40 h-24"></textarea>
                <button type="submit" className="w-full bg-white/10 border border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-colors mt-2">Lưu</button>
              </form>
           </div>
        </div>
      )}

      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
           <div className="bg-gray-900 lg:bg-white/10 backdrop-blur-xl p-6 rounded-3xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto border border-white/20">
              <button onClick={() => setIsUserModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 text-white rounded-full flex items-center justify-center bg-white/10 border border-white/20 hover:bg-white/20">✕</button>
              <h2 className="text-xl font-bold mb-4 text-white">Chỉnh Sửa Quyền</h2>
              <form onSubmit={handleSaveUser} className="space-y-3">
                <input required type="text" placeholder="Tên hiển thị" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} className="w-full bg-white/5 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-white/40" />
                <input required type="email" placeholder="Email" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} className="w-full bg-white/5 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-white/40" />
                <div className="grid grid-cols-2 gap-3">
                  <input required type="text" placeholder="SĐT" value={userFormData.phone} onChange={e => setUserFormData({...userFormData, phone: e.target.value})} className="w-full bg-white/5 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-white/40" />
                  <select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value})} className="w-full bg-white/5 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-white/40">
                    <option value="user" className="bg-gray-900">User</option>
                    <option value="admin" className="bg-gray-900">Admin</option>
                  </select>
                </div>
                <input type="password" placeholder="Mật khẩu mới (bỏ qua nếu không đổi)" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} className="w-full bg-white/5 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-white/40" />
                <button type="submit" className="w-full bg-white/10 border border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-colors mt-2">Cập Nhật</button>
              </form>
           </div>
        </div>
      )}

      {isBannerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
           <div className="bg-gray-900 lg:bg-white/10 backdrop-blur-xl p-6 rounded-3xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto border border-white/20">
              <button onClick={() => setIsBannerModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 text-white rounded-full flex items-center justify-center bg-white/10 border border-white/20 hover:bg-white/20">✕</button>
              <h2 className="text-xl font-bold mb-4 text-white">{editBannerId ? "Sửa Banner" : "Thêm Banner"}</h2>
              <form onSubmit={handleSaveBanner} className="space-y-3">
                <input required type="text" placeholder="Tên banner" value={bannerFormData.title} onChange={e => setBannerFormData({...bannerFormData, title: e.target.value})} className="w-full bg-white/5 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-white/40" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Bắt đầu</label>
                    <input required type="date" value={bannerFormData.startDate} onChange={e => setBannerFormData({...bannerFormData, startDate: e.target.value})} className="w-full bg-white/5 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-white/40" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Kết thúc</label>
                    <input required type="date" value={bannerFormData.endDate} onChange={e => setBannerFormData({...bannerFormData, endDate: e.target.value})} className="w-full bg-white/5 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-white/40" />
                  </div>
                </div>
                <input required type="text" placeholder="URL Hình ảnh" value={bannerFormData.image} onChange={e => setBannerFormData({...bannerFormData, image: e.target.value})} className="w-full bg-white/5 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-white/40" />
                <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/20 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={bannerFormData.isActive} onChange={e => setBannerFormData({...bannerFormData, isActive: e.target.checked})} className="w-4 h-4 accent-orange-500" />
                  <span className="text-sm font-medium text-white">Cho phép hiển thị</span>
                </label>
                <button type="submit" className="w-full bg-white/10 border border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-colors mt-2">Lưu</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}