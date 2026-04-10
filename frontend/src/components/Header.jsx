import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { SERVER_URL } from "../config";
import { clearCart } from "../redux/cartSlice"; 

const Header = ({ user, setUser }) => {
  const [locationStr, setLocationStr] = useState("Đang định vị...");
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (searchKeyword.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate(`/menu`);
    }
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const saveLocationToDB = async (fullAddress) => {
    setLocationStr(fullAddress);
    if (user) {
      try {
        await axios.put(`${SERVER_URL}/api/auth/update-location`, { location: fullAddress }, getAuthHeader());
      } catch (err) {}
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const address = res.data.address;
            const street = [address.house_number, address.road || address.pedestrian].filter(Boolean).join(" ");
            const ward = address.suburb || address.village || address.quarter || address.hamlet;
            const district = address.city_district || address.district || address.county;
            const city = address.city || address.province || address.state;
            saveLocationToDB([street, ward, district, city].filter(Boolean).join(", "));
          } catch {
            fallbackToIP();
          }
        },
        () => fallbackToIP()
      );
    } else {
      fallbackToIP();
    }

    function fallbackToIP() {
      axios.get("https://ipwho.is/").then((res) => {
        if (res.data.success) saveLocationToDB(`${res.data.city}, ${res.data.region}, ${res.data.country}`);
        else saveLocationToDB("Biên Hòa, Đồng Nai");
      }).catch(() => saveLocationToDB("Biên Hòa, Đồng Nai"));
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token"); 
    setUser(null);
    dispatch(clearCart()); 
    setIsMobileMenuOpen(false);
    navigate("/"); 
  };

  const navLinks = [
    { path: "/", label: "Trang chủ" },
    { path: "/menu", label: "Thực đơn" },
    { path: "/table-order", label: "Đặt bàn" },
    { path: "/ai-scan", label: "AI Scan" }
  ];

  return (
    <>
      {/* HEADER LIGHT THEME VỚI HIỆU ỨNG GLASSMORPHISM TƯƠI SÁNG */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm pb-3 lg:pb-0 lg:h-[100px] transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between h-full">

          <div className="flex items-center justify-between h-[70px] lg:h-[100px]">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/" className="flex items-center h-[70px] lg:h-[100px]">
                <img src="/img/MTK.png" alt="MTK Logo" className="h-[75%] lg:h-[85%] w-auto object-contain scale-[1.2] lg:scale-[1.3] origin-left" />
              </Link>
            </motion.div>

            {/* Nút Mobile Menu & Giỏ Hàng Mobile */}
            <div className="flex lg:hidden items-center gap-3">
              {user && user.role !== "admin" && (
                <Link to="/cart" className="relative p-2 text-gray-700 hover:text-orange-500 bg-gray-50 hover:bg-orange-50 rounded-full border border-gray-200 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  {totalQuantity > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">{totalQuantity}</span>}
                </Link>
              )}
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-800 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
            </div>
          </div>

          {/* Điều hướng Desktop */}
          <nav className="hidden lg:flex items-center gap-8 mx-8">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} className={`font-extrabold text-[13px] uppercase tracking-widest transition-colors duration-300 ${location.pathname === link.path ? "text-orange-500" : "text-gray-600 hover:text-orange-500"}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Thanh Tìm Kiếm Trắng Sáng */}
          <div className="w-full lg:flex-1 lg:max-w-sm mx-0 mt-1 lg:mt-0 relative">
            <form onSubmit={handleSearch} className="relative w-full">
              <input 
                type="text" 
                value={searchKeyword} 
                onChange={(e) => setSearchKeyword(e.target.value)} 
                placeholder="Tìm món ăn ngon..." 
                className="w-full bg-gray-100 border border-gray-200 rounded-full pl-12 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all shadow-inner" 
              />
              <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>
          </div>

          {/* Cụm Tài Khoản Desktop */}
          <div className="hidden lg:flex items-center gap-5 ml-auto">
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === "admin" ? (
                  <Link to="/admin" className="text-white bg-red-500 hover:bg-red-600 px-5 py-2.5 rounded-full font-bold text-sm tracking-wide shadow-md shadow-red-500/20 transition-all hover:-translate-y-0.5">⚙️ Quản Trị</Link>
                ) : (
                  <Link to="/profile" className="font-bold text-gray-700 hover:text-orange-500 text-sm flex items-center gap-2 transition-colors">
                    <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">👤</span>
                    {user.name}
                  </Link>
                )}
                <button onClick={handleLogout} className="text-sm font-bold text-gray-500 hover:text-red-500 border-l border-gray-300 pl-4 transition-colors">Đăng xuất</button>
              </div>
            ) : (
              <Link to="/login" className="font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-7 py-2.5 rounded-full shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all tracking-wide text-sm">Đăng nhập</Link>
            )}

            {/* Giỏ Hàng Desktop */}
            {user && user.role !== "admin" && (
              <Link to="/cart" className="relative p-2.5 text-gray-700 hover:text-orange-500 bg-white hover:bg-orange-50 rounded-full border border-gray-200 ml-2 shadow-sm transition-all hover:border-orange-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                {totalQuantity > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[11px] font-black px-1.5 py-0.5 rounded-full shadow-sm">{totalQuantity}</span>}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE MENU TRẮNG SÁNG */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-gray-900/40 z-[60] lg:hidden backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white border-l border-gray-200 z-[70] p-6 flex flex-col shadow-2xl lg:hidden">
              <div className="flex justify-end mb-6">
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex flex-col gap-4 mb-8">
                {navLinks.map(link => (
                  <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`text-lg font-black uppercase tracking-wider py-3 border-b border-gray-100 transition-colors ${location.pathname === link.path ? "text-orange-500" : "text-gray-800"}`}>
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-auto">
                {user ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 mb-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-black text-xl shadow-md">{user.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="text-gray-900 font-bold">{user.name}</p>
                        <p className="text-xs text-gray-500 font-medium capitalize">{user.role}</p>
                      </div>
                    </div>
                    {user.role === "admin" ? (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-gray-100 border border-gray-200 text-gray-900 py-3.5 rounded-xl font-bold tracking-wide">⚙️ Admin Panel</Link>
                    ) : (
                      <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-gray-100 border border-gray-200 text-gray-900 py-3.5 rounded-xl font-bold tracking-wide">Hồ sơ của tôi</Link>
                    )}
                    <button onClick={handleLogout} className="w-full bg-red-50 border border-red-100 text-red-600 py-3.5 rounded-xl font-bold mt-2 tracking-wide">Đăng xuất</button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-center items-center w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">Đăng nhập</Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;