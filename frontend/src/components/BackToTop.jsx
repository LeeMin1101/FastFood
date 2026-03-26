import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Hàm theo dõi vị trí cuộn chuột
  useEffect(() => {
    const toggleVisibility = () => {
      // Nếu cuộn xuống quá 300px thì hiện nút, ngược lại thì ẩn
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Hàm xử lý khi click vào nút
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth" // Hiệu ứng trượt mượt mà thay vì giật cục
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          // 👉 Đã sửa: bottom-32 (mobile) và lg:bottom-28 (PC) để đẩy nút lùi lên trên, nhường chỗ cho Chatbot
          className="fixed bottom-[100px] lg:bottom-[120px] right-6 lg:right-10 z-[100] p-3 md:p-4 bg-gradient-to-tr from-orange-500 to-red-600 text-white rounded-full shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:shadow-[0_0_30px_rgba(249,115,22,0.8)] hover:scale-110 transition-all outline-none"
          aria-label="Cuộn lên đầu trang"
        >
          {/* Icon Mũi tên lên (SVG tối giản) */}
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}