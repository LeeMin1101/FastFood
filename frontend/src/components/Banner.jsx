import React, { useState, useEffect } from "react";
import axios from "axios";
import { SERVER_URL } from "../config";

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Chuyển đường dẫn ảnh cho đúng
  const getImageUrl = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    return `${SERVER_URL}${img}`;
  };

  // Lấy banner từ backend
  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/banners/active`);
      setBanners(res.data);
    } catch (error) {
      console.error("Lỗi lấy banner:", error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Tự động chuyển slide
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [banners]);

  // Nếu không có banner
  if (banners.length === 0) {
    return (
      <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center py-12 rounded-3xl mx-auto max-w-7xl px-6">
        <h2 className="text-3xl font-black text-orange-300">
          MTK FastFood - Ngon Khó Cưỡng!
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] rounded-3xl overflow-hidden shadow-2xl group border border-white/20">

        {/* Banner images */}
        {banners.map((banner, index) => (
          <img
            key={banner._id}
            src={getImageUrl(banner.image)}
            alt={banner.title}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          />
        ))}

        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent z-5"></div>

        {/* Nút trái */}
        <button
          onClick={() =>
            setCurrentIndex(
              currentIndex === 0 ? banners.length - 1 : currentIndex - 1
            )
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 w-10 h-10 rounded-full flex items-center justify-center text-white z-20 opacity-0 group-hover:opacity-100 transition-all font-bold"
        >
          &lt;
        </button>

        {/* Nút phải */}
        <button
          onClick={() =>
            setCurrentIndex(
              currentIndex === banners.length - 1 ? 0 : currentIndex + 1
            )
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 w-10 h-10 rounded-full flex items-center justify-center text-white z-20 opacity-0 group-hover:opacity-100 transition-all font-bold"
        >
          &gt;
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-orange-400 w-6"
                  : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}