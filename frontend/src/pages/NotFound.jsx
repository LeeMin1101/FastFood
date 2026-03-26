import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[9999] w-screen h-screen flex flex-col items-center justify-center overflow-y-auto px-4 py-10 bg-gray-950">
      
      <img 
        src="/img/404.jpg"
        alt="Background 404" 
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      />

      {/* Khung nội dung */}
      <div className="relative z-10 text-center max-w-2xl bg-white/5 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[3rem] shadow-2xl m-auto">
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <h1 className="text-[120px] md:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-red-600 leading-none drop-shadow-2xl">
            404
          </h1>
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-4xl font-black text-white mt-2 mb-4"
        >
          Ôi không! Rớt mất món rồi! 😭
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-orange-200 text-base md:text-lg mb-10 font-medium"
        >
          Trang bạn đang tìm kiếm dường như không tồn tại hoặc đã bị ai đó lén ăn mất. Hãy quay lại menu để chọn món khác ngon hơn nhé!
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-red-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🏠</span> Về Trang Chủ
          </Link>
          
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/20 text-white font-bold text-lg rounded-2xl hover:bg-white/10 hover:-translate-y-1 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🍔</span> Xem Thực Đơn
          </Link>
        </motion.div>

      </div>
    </div>
  );
}