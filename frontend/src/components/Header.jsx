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
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 pb-3 lg:pb-0 lg:h-[110px]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between h-full">

          <div className="flex items-center justify-between h-[70px] lg:h-[110px]">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/" className="flex items-center h-[70px] lg:h-[110px]">
                <img src="/img/MTK.png" alt="MTK Logo" className="h-[80%] lg:h-full w-auto object-contain scale-[1.2] lg:scale-[1.35] origin-left" />
              </Link>
            </motion.div>

            <div className="flex lg:hidden items-center gap-3">
              {user && user.role !== "admin" && (
                <Link to="/cart" className="relative p-2 text-white bg-white/5 rounded-full border border-white/10">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  {totalQuantity > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalQuantity}</span>}
                </Link>
              )}
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-white">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 mx-8">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} className={`font-bold text-sm uppercase tracking-wider transition-colors ${location.pathname === link.path ? "text-orange-500" : "text-white hover:text-orange-400"}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="w-full lg:flex-1 lg:max-w-sm mx-0 mt-1 lg:mt-0">
            <form onSubmit={handleSearch} className="relative w-full">
              <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="Tìm món ăn..." className="w-full bg-white/10 lg:bg-white/5 border border-white/20 rounded-full pl-11 pr-4 py-2.5 lg:py-2.5 text-sm text-white placeholder-gray-400 focus:border-orange-500 outline-none" />
              <button type="submit" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
            </form>
          </div>

          <div className="hidden lg:flex items-center gap-6 ml-auto">
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === "admin" ? (
                  <Link to="/admin" className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full font-bold text-sm">⚙️ Admin</Link>
                ) : (
                  <Link to="/profile" className="font-bold text-white hover:text-orange-400 text-sm">👋 {user.name}</Link>
                )}
                <button onClick={handleLogout} className="text-sm font-bold text-gray-300 hover:text-red-400 border-l border-white/20 pl-4">Đăng xuất</button>
              </div>
            ) : (
              <Link to="/login" className="font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 px-6 py-2.5 rounded-full shadow-lg">Đăng nhập</Link>
            )}

            {user && user.role !== "admin" && (
              <Link to="/cart" className="relative p-2.5 text-white hover:text-orange-400 bg-white/5 rounded-full border border-white/10 ml-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                {totalQuantity > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{totalQuantity}</span>}
              </Link>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-gray-900 border-l border-white/10 z-[70] p-6 flex flex-col shadow-2xl lg:hidden">
              <div className="flex justify-end mb-6">
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-2 bg-white/5 rounded-full"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              <div className="flex flex-col gap-4 mb-8">
                {navLinks.map(link => (
                  <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`text-lg font-bold py-2 border-b border-white/10 ${location.pathname === link.path ? "text-orange-500" : "text-white"}`}>
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-auto">
                {user ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-black text-xl">{user.name.charAt(0).toUpperCase()}</div>
                      <div><p className="text-white font-bold">{user.name}</p></div>
                    </div>
                    {user.role === "admin" ? (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold">Admin Panel</Link>
                    ) : (
                      <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold">Hồ sơ của tôi</Link>
                    )}
                    <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-500 py-3 rounded-xl font-bold mt-2">Đăng xuất</button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-center items-center w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3.5 rounded-xl font-bold shadow-lg">Đăng nhập</Link>
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