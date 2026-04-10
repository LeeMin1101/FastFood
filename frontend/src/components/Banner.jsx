import React, { useState, useEffect } from "react";
import axios from "axios";
import { SERVER_URL } from "../config"; 

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const getImageUrl = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    if (!img.startsWith("/")) img = "/" + img; 
    return `${SERVER_URL}${img}`;
  };

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

  const nextSlide = () =>
    setCurrentIndex((prev) =>
      prev === banners.length - 1 ? 0 : prev + 1
    );

  const prevSlide = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? banners.length - 1 : prev - 1
    );

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleTouchStart = (e) =>
    setTouchStart(e.targetTouches[0].clientX);

  const handleTouchMove = (e) =>
    setTouchEnd(e.targetTouches[0].clientX);

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (banners.length === 0) {
    return (
      <div className="w-full bg-orange-100 flex items-center justify-center py-20">
        <h2 className="text-3xl font-black text-orange-500">
          MTK FastFood - Ngon Khó Cưỡng!
        </h2>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden group cursor-grab active:cursor-grabbing shadow-sm"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {banners.map((banner, index) => (
          <img
            key={banner._id}
            src={getImageUrl(banner.image)}
            alt={banner.title}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentIndex
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          />
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/90 backdrop-blur w-10 h-10 rounded-full flex items-center justify-center text-gray-800 z-20 opacity-0 group-hover:opacity-100 transition-all font-bold"
        >
          &lt;
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/90 backdrop-blur w-10 h-10 rounded-full flex items-center justify-center text-gray-800 z-20 opacity-0 group-hover:opacity-100 transition-all font-bold"
        >
          &gt;
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all shadow-md ${
                index === currentIndex
                  ? "bg-orange-500 w-8"
                  : "bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}