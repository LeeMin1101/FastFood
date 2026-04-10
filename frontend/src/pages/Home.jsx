import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Banner from '../components/Banner'; 
import { SERVER_URL } from '../config';

// 👉 IMPORT THƯ VIỆN REACT-ICONS
import { FiTruck, FiCpu, FiHeadphones, FiGift } from "react-icons/fi";

// Data tĩnh cho phần Dịch vụ tiện ích đã đổi thành Icon
const features = [
  { icon: <FiTruck />, title: "Miễn Phí Vận Chuyển", desc: "Cho đơn từ 200k hoặc bán kính 5km" },
  { icon: <FiCpu />, title: "Chatbox AI Thông Minh", desc: "Gợi ý món ngon chuẩn gu của bạn" },
  { icon: <FiHeadphones />, title: "Hỗ Trợ Trực Tuyến 24/7", desc: "Luôn sẵn sàng giải đáp mọi thắc mắc" },
  { icon: <FiGift />, title: "Khuyến Mãi Ngập Tràn", desc: "Voucher giảm giá cập nhật mỗi ngày" }
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // Hàm xử lý đường dẫn ảnh từ Backend
  const getImageUrl = (img) => {
    if (!img) return "https://placehold.co/400x400/ffedd5/ea580c?text=No+Image";
    if (img.startsWith("http")) return img;
    if (!img.startsWith("/")) img = "/" + img; 
    return `${SERVER_URL}${img}`;
  };

  // Gọi API lấy dữ liệu sản phẩm thật (Chỉ lấy Gà Rán)
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/api/products`);
        
        // 👉 Lọc đúng những món có danh mục là "Gà Rán"
        const gaRanProducts = res.data.filter(product => product.category === "Gà Rán");
        
        // Lấy 4 món Gà Rán đầu tiên để hiển thị
        setFeaturedProducts(gaRanProducts.slice(0, 4));
      } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm nổi bật:", error);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col text-gray-800">
      
      {/* BANNER NẰM SÁT DƯỚI HEADER */}
      <section className="w-full bg-white">
        <Banner />
      </section>

      {/* PROMO BAR Ở DƯỚI BANNER MÀU CAM NHẠT */}
      <div className="w-full bg-orange-50 border-b border-orange-100 py-3 overflow-hidden flex items-center relative z-20 shadow-inner">
        <motion.div
          animate={{ x: ["100%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="whitespace-nowrap font-bold text-sm text-gray-700 tracking-wider flex items-center gap-12"
        >
          <span className="text-orange-600">🔥 ƯU ĐÃI THÁNG NÀY: GIẢM 20% CHO ĐƠN HÀNG TỪ 200K - NHẬP MÃ: MTK20</span>
          <span>🛵 FREESHIP TRONG BÁN KÍNH 5KM</span>
          <span className="text-orange-600">🥤 TẶNG KÈM NƯỚC KHI MUA COMBO GÀ RÁN</span>
          <span>🔥 ƯU ĐÃI THÁNG NÀY: GIẢM 20% CHO ĐƠN HÀNG TỪ 200K - NHẬP MÃ: MTK20</span>
        </motion.div>
      </div>

      {/* DỊCH VỤ & TIỆN ÍCH - ĐÃ SỬ DỤNG REACT-ICONS */}
      <section className="w-full bg-white pb-12 border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {features.map((item, index) => (
              <div key={index} className="flex items-center gap-5 px-6 w-full md:w-1/4 pt-4 md:pt-0 group cursor-default">
                {/* Style Icon Nổi Bật */}
                <div className="text-4xl text-orange-500 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide group-hover:text-orange-600 transition-colors">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SẢN PHẨM NỔI BẬT (Render Data Gà Rán) */}
      <section className="w-full py-20 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col items-center mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-extrabold text-gray-900 uppercase tracking-tight mb-4"
            >
              Sản Phẩm Nổi Bật
            </motion.h2>
            <div className="w-24 h-1.5 bg-orange-500 rounded-full"></div>
            <p className="mt-4 text-gray-500 text-center max-w-2xl">
              Khám phá những món gà rán giòn rụm, bán chạy nhất tại MTK FastFood. Nóng hổi, đậm vị và sẵn sàng giao đến bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="relative h-56 overflow-hidden bg-gray-100 p-4 flex items-center justify-center">
                    <div className="absolute top-4 left-4 z-10 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-sm shadow-md">
                      Bán Chạy
                    </div>
                    <img 
                      src={getImageUrl(product.image)} 
                      alt={product.name} 
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 truncate" title={product.name}>{product.name}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xl font-black text-orange-600">
                        {Number(product.price).toLocaleString('vi-VN')} ₫
                      </span>
                      <Link to={`/product/${product._id}`} className="w-9 h-9 bg-gray-900 hover:bg-orange-500 text-white rounded-full flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center py-10 text-gray-500">
                Đang tải dữ liệu gà rán hoặc chưa có sản phẩm nào thuộc danh mục này...
              </div>
            )}
          </div>

          <div className="mt-14 flex justify-center">
            <Link to="/menu" className="px-10 py-3 rounded-full border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-colors duration-300">
              Xem Toàn Bộ Thực Đơn
            </Link>
          </div>
        </div>
      </section>

      {/* CÂU CHUYỆN THƯƠNG HIỆU (BRAND STORY) */}
      <section className="relative w-full bg-white py-24 md:py-32 overflow-hidden">
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8">
          
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block relative mb-4"
            >
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 uppercase tracking-tight">
                Uy tín tạo nên MTK
              </h2>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-orange-500 rounded-full"></div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hình ảnh */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex justify-center"
            >
              <img src="/img/MTK.png" alt="MTK Logo Story" className="w-full max-w-md drop-shadow-2xl" />
            </motion.div>

            {/* Nội dung */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white border border-gray-200 p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-gray-200/50"
            >
              <h3 className="text-2xl font-extrabold text-gray-900 mb-4 uppercase tracking-wide">
                Câu Chuyện Thương Hiệu
              </h3>
              <div className="w-12 h-1 bg-orange-500 mb-8 rounded-full"></div>
              
              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">
                Biểu tượng 3 cậu bé trên logo không chỉ là hình ảnh đại diện, mà chính là linh hồn của thương hiệu. Đó là <strong className="text-gray-900">Minh, Thiện và Khang</strong> — ba nhà sáng lập của MTK FastFood. Mỗi thành viên nắm giữ một vai trò nòng cốt để tạo nên hệ thống hoàn hảo:
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50/80 hover:bg-white border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300">
                  <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">M</div>
                  <div>
                    <strong className="text-gray-900 block font-extrabold text-lg mb-1">Minh - Sự Sáng Tạo</strong>
                    <span className="text-sm text-gray-500 leading-relaxed block">Bếp trưởng đứng sau những công thức bí truyền tuyệt hảo.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50/80 hover:bg-white border border-gray-100 hover:border-red-200 hover:shadow-lg transition-all duration-300">
                  <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">T</div>
                  <div>
                    <strong className="text-gray-900 block font-extrabold text-lg mb-1">Thiện - Sự Vận Hành</strong>
                    <span className="text-sm text-gray-500 leading-relaxed block">Quản lý hệ thống, đảm bảo đồ ăn giao đến tay luôn nóng hổi.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50/80 hover:bg-white border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300">
                  <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">K</div>
                  <div>
                    <strong className="text-gray-900 block font-extrabold text-lg mb-1">Khang - Sự Tận Tâm</strong>
                    <span className="text-sm text-gray-500 leading-relaxed block">Chăm sóc trải nghiệm khách hàng, mang lại sự hài lòng tuyệt đối.</span>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}