import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 font-sans flex flex-col">
      
      {/* Promo Bar */}
      <div className="w-full bg-gradient-to-r from-orange-600 to-red-600 py-2.5 overflow-hidden flex items-center relative z-20 shadow-lg border-b border-white/10">
        <motion.div
          animate={{ x: ["100%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="whitespace-nowrap font-bold text-sm md:text-base text-white tracking-widest flex items-center gap-10"
        >
          <span>ƯU ĐÃI THÁNG NÀY: GIẢM 20% CHO ĐƠN HÀNG TỪ 200K - NHẬP MÃ: MTK20</span>
          <span>FREESHIP TRONG BÁN KÍNH 5KM</span>
          <span>TẶNG KÈM NƯỚC KHI MUA COMBO GÀ RÁN</span>
          <span>ƯU ĐÃI THÁNG NÀY: GIẢM 20% CHO ĐƠN HÀNG TỪ 200K - NHẬP MÃ: MTK20</span>
        </motion.div>
      </div>

      {/* Hero Banner Section */}
      <div className="relative w-full h-[60vh] md:h-[80vh] lg:h-[90vh] bg-black">
        <img 
          src="/img/banner_new.png" 
          alt="MTK FastFood Banner" 
          className="w-full h-full object-cover opacity-90"
        />
        
        <div className="absolute inset-0 max-w-[1400px] mx-auto px-4 sm:px-8 flex flex-col justify-center items-start pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-32 md:mt-48 lg:mt-64 pointer-events-auto pl-4 md:pl-10"
          >
            <Link 
              to="/menu" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-lg md:text-xl px-10 py-4 rounded-full shadow-[0_10_30px_rgba(249,115,22,0.4)] hover:scale-105 hover:shadow-[0_10_40px_rgba(249,115,22,0.6)] transition-all duration-300"
            >
              ĐẶT MÓN NGAY
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Brand Story Section */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-24 md:py-32">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-6">
            Uy tín tạo nên MTK
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Chúng tôi không chỉ phục vụ thức ăn nhanh. Chúng tôi mang đến trải nghiệm Nhanh - Nóng - Ngon mỗi ngày bằng cả trái tim.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <img src="/img/MTK.png" alt="MTK Logo Story" className="w-full max-w-md drop-shadow-[0_20px_50px_rgba(249,115,22,0.2)]" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl"
          >
            <h3 className="text-2xl font-black text-white mb-6 border-b border-white/10 pb-4">Câu Chuyện Thương Hiệu</h3>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Biểu tượng 3 cậu bé trên logo không chỉ là hình ảnh đại diện, mà chính là linh hồn của thương hiệu. Đó là <strong>Minh, Thiện và Khang</strong> — ba nhà sáng lập của MTK FastFood.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Mỗi thành viên nắm giữ một vai trò nòng cốt, là những mảnh ghép không thể thiếu để tạo nên một hệ thống vận hành hoàn hảo:
            </p>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div>
                  <strong className="text-orange-400 text-xl block">Minh</strong>
                  <span className="text-gray-300">Đam mê sáng tạo hương vị, bếp trưởng đứng sau những công thức tuyệt hảo.</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div>
                  <strong className="text-orange-400 text-xl block">Thiện</strong>
                  <span className="text-gray-300">Quản lý vận hành, đảm bảo đồ ăn luôn "Nóng" và đến tay khách hàng nhanh nhất.</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div>
                  <strong className="text-orange-400 text-xl block">Khang</strong>
                  <span className="text-gray-300">Chăm sóc trải nghiệm khách hàng, mang lại sự tận tâm và hài lòng tuyệt đối.</span>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

    </div>
  );
}