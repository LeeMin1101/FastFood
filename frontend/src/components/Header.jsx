import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import axios from "axios";
import { SERVER_URL } from "../config";

const Header = ({ user, setUser }) => {
  const [location, setLocation] = useState("Đang định vị...");
  const cartItems = useSelector((state) => state.cart.items);

  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/?search=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate(`/`);
    }
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const saveLocationToDB = async (fullAddress) => {
    setLocation(fullAddress);
    if (user) {
      try {
        await axios.put(
          `${SERVER_URL}/api/auth/update-location`,
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
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );

            const address = res.data.address;

            const street = [
              address.house_number,
              address.road || address.pedestrian,
            ]
              .filter(Boolean)
              .join(" ");

            const ward =
              address.suburb ||
              address.village ||
              address.quarter ||
              address.hamlet;

            const district =
              address.city_district ||
              address.district ||
              address.county;

            const city = address.city || address.province || address.state;

            const exactLocation = [street, ward, district, city]
              .filter(Boolean)
              .join(", ");

            saveLocationToDB(exactLocation);
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
      axios
        .get("https://ipwho.is/")
        .then((res) => {
          if (res.data.success) {
            saveLocationToDB(
              `${res.data.city}, ${res.data.region}, ${res.data.country}`
            );
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
    <header className="fixed top-0 left-0 right-0 z-50 h-[110px] bg-black/40 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between h-full">

        {/* LOGO */}
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link
            to="/"
            className="flex items-center h-[90px] md:h-[100px] lg:h-[110px]"
          >
            <img
              src="/img/MTK.png"
              alt="MTK Logo"
              className="h-full w-auto object-contain scale-[1.35]"
            />
          </Link>
        </motion.div>

        {/* SEARCH */}
        <div className="hidden lg:flex flex-1 max-w-xl mx-10">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Bạn muốn ăn gì hôm nay?"
              className="w-full bg-white/5 border border-white/20 rounded-full pl-12 pr-4 py-3.5 text-white placeholder-gray-400 focus:bg-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all outline-none"
            />

            <button
              type="submit"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-orange-500"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-6">

          {/* LOCATION */}
          <div
            className="hidden xl:flex items-center gap-2 text-sm text-gray-300"
            title={location}
          >
            <svg
              className="w-5 h-5 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>

            <span className="truncate max-w-[200px] hover:text-orange-400">
              {location}
            </span>
          </div>

          {/* USER */}
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/20">
              {user.role === "admin" ? (
                <>
                  <Link
                    to="/admin"
                    className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full font-bold text-sm"
                  >
                    ⚙️ Admin
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-sm font-bold text-gray-300 hover:text-red-400"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    className="hidden sm:flex flex-col hover:bg-white/5 px-3 py-2 rounded-xl"
                  >
                    <span className="font-bold text-white">
                      👋 {user.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      Quản lý tài khoản
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-sm font-bold text-gray-300 hover:text-red-400"
                  >
                    Đăng xuất
                  </button>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 px-6 py-3 rounded-full shadow-lg"
            >
              Đăng nhập
            </Link>
          )}

          {/* CART */}
          {user?.role !== "admin" && (
            <Link
              to="/cart"
              className="relative p-3 text-white hover:text-orange-400 bg-white/5 hover:bg-orange-500/20 rounded-full border border-white/10"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>

              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
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