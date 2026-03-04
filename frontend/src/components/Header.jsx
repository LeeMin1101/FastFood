import React, { useEffect, useState } from "react";
// ĐÃ SỬA: Import thêm useNavigate để chuyển trang khi tìm kiếm
import { Link, useNavigate } from "react-router-dom"; 
import { useSelector } from "react-redux";
import axios from "axios";

const Header = ({ user, setUser }) => {
  const [location, setLocation] = useState("Đang định vị...");
  const cartItems = useSelector((state) => state.cart.items);
  
  // --- MỚI: STATE VÀ HÀM CHO THANH TÌM KIẾM ---
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearch = (e) => {
    e.preventDefault(); // Chặn việc load lại trang
    if (searchKeyword.trim()) {
      // Đẩy từ khóa lên URL và chuyển về trang chủ
      navigate(`/?search=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate(`/`); // Nếu để trống thì hiện tất cả
    }
  };
  // -------------------------------------------

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const saveLocationToDB = async (fullAddress) => {
    setLocation(fullAddress); 
    if (user) {
      try {
        await axios.put(
          "http://localhost:3000/api/auth/update-location", 
          { location: fullAddress }, 
          getAuthHeader()
        );
      } catch (err) {
        console.log("Lỗi đồng bộ vị trí:", err);
      }
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            
            const address = res.data.address;
            const houseNumber = address.house_number || "";
            const road = address.road || address.pedestrian || "";
            const ward = address.suburb || address.village || address.quarter || address.hamlet || "";
            const district = address.county || address.city_district || address.district || "";
            const city = address.city || address.province || address.state || "";

            const streetInfo = [houseNumber, road].filter(Boolean).join(" ");
            const exactLocation = [streetInfo, ward, district, city]
              .filter(item => item !== "" && item !== undefined)
              .join(", ");

            saveLocationToDB(exactLocation || "Không xác định được địa chỉ cụ thể");
          } catch (error) {
            fallbackToIP();
          }
        },
        (error) => {
          fallbackToIP();
        }
      );
    } else {
      fallbackToIP();
    }

    function fallbackToIP() {
      axios
        .get("https://ipwho.is/") 
        .then((res) => {
          if (res.data.success) {
            saveLocationToDB(`${res.data.city}, ${res.data.region}, ${res.data.country}`);
          } else {
            saveLocationToDB("Biên Hòa, Đồng Nai"); 
          }
        })
        .catch(() => saveLocationToDB("Biên Hòa, Đồng Nai")); 
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 sm:px-6 py-2">

        {/* --- PHẦN LOGO --- */}
        <Link to="/" className="flex items-center h-20 sm:h-24 lg:h-28 transition-transform hover:scale-105">
          <img src="/img/MTK.png" alt="MTK FastFood Logo" className="h-full w-auto object-contain mix-blend-multiply scale-[1.3] sm:scale-[1.5] origin-center" />
        </Link>

        {/* --- ĐÃ SỬA: THANH TÌM KIẾM --- */}
        <div className="hidden lg:block w-1/3 ml-4">
          {/* Đổi div thành form để bắt sự kiện Enter */}
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Bạn muốn ăn gì hôm nay?"
              className="w-full bg-gray-100 border-2 border-transparent rounded-full pl-12 pr-4 py-2.5 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all shadow-sm outline-none"
            />
            {/* Đổi svg thành button type="submit" */}
            <button type="submit" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden xl:flex items-center gap-1 text-sm text-gray-600 font-medium cursor-help" title={location}>
            <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate max-w-[200px]">{location}</span>
          </div>

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === "admin" ? (
                <div className="flex items-center gap-3">
                  <Link to="/admin" className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full font-bold text-sm transition-colors shadow-sm flex items-center gap-2">
                    ⚙️ Quản trị viên
                  </Link>
                  <div className="border-l-2 border-gray-200 pl-3">
                    <button onClick={handleLogout} className="text-sm font-bold text-gray-500 hover:text-red-600 px-2 py-1.5 transition-colors">Đăng xuất</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-3 border-l-2 border-gray-200">
                  <Link to="/profile" className="hidden sm:flex flex-col items-start hover:bg-orange-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer group">
                    <span className="font-bold text-gray-800 group-hover:text-orange-600 flex items-center gap-1">
                      <span className="text-lg">👋</span> {user.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium ml-6 group-hover:text-orange-400">Quản lý tài khoản</span>
                  </Link>
                  <button onClick={handleLogout} className="text-sm font-bold text-gray-500 hover:text-red-600 px-2 py-1.5 transition-colors">Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-6 py-2.5 rounded-full shadow-md transition-all">
              Đăng nhập
            </Link>
          )}

          {/* Cart Icon */}
          {user?.role !== "admin" && (
            <Link to="/cart" id="cart-icon" className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors bg-gray-50 hover:bg-orange-50 rounded-full group">
              <svg className="w-8 h-8 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm animate-bounce">
                  {cartItems.length}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;