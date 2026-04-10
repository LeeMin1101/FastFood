import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPhoneCall, FiMail, FiChevronRight } from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaHamburger } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative bg-[#0d0d0d] text-gray-300 pt-16 pb-8 mt-auto overflow-hidden border-t-[3px] border-orange-500 shadow-[0_-15px_40px_-15px_rgba(249,115,22,0.25)]">
      
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-red-900/10 via-transparent to-transparent blur-3xl pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-orange-600/5 via-transparent to-transparent blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-12">
          
          {/* Brand */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-5 lg:col-span-4 space-y-6"
          >
            <Link to="/" className="text-3xl font-extrabold text-white flex items-center gap-3 group w-fit">
              <div className="text-3xl text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)] transform group-hover:scale-110 transition-all duration-300">
                <FaHamburger />
              </div> 
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-sm">
                MTK FastFood
              </span>
            </Link>
            
            <p className="text-sm md:text-base leading-relaxed text-gray-400">
              Trao gửi hương vị thơm ngon trong từng món ăn. Giao hàng thần tốc 30 phút.
            </p>
            
            <div className="flex gap-4 pt-2">
              <motion.a 
                whileHover={{ scale: 1.1, y: -3 }}
                href="https://www.facebook.com/MinhSieuCute.1101" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300 border border-white/10 shadow-lg"
              >
                <FaFacebookF className="w-5 h-5" />
              </motion.a>

              <motion.a 
                whileHover={{ scale: 1.1, y: -3 }}
                href="#" 
                className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-red-500 hover:to-purple-500 transition-all duration-300 border border-white/10 shadow-lg"
              >
                <FaInstagram className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-3 lg:col-span-3"
          >
            <h3 className="text-base font-black text-white mb-6 uppercase tracking-wider relative inline-block">
              Điều Hướng
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-orange-500 rounded-full"></span>
            </h3>

            <ul className="space-y-4">
              {[
                { name: "Trang Chủ", path: "/" },
                { name: "Thực Đơn", path: "/menu" },
                { name: "Đặt Bàn", path: "/table-order" },
                { name: "Đăng Nhập", path: "/login" },
              ].map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.path} 
                    className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-all duration-300 group font-medium text-sm md:text-base"
                  >
                    <span className="text-orange-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <FiChevronRight />
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-4 lg:col-span-5"
          >
            <h3 className="text-base font-black text-white mb-6 uppercase tracking-wider relative inline-block">
              Liên Hệ
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-orange-500 rounded-full"></span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-orange-500/30 transition-all group">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all text-lg">
                  <FiPhoneCall />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Hotline</p>
                  <p className="text-white font-black text-sm md:text-base">0774.155.497</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-orange-500/30 transition-all group">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all text-lg">
                  <FiMail />
                </div>
                <div className="truncate w-full">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Email</p>
                  <p className="text-gray-300 text-xs md:text-sm truncate">hoitruongzero@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="w-full rounded-xl overflow-hidden border border-white/10 shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.420594896585!2d106.6991629153343!3d10.825032260695026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528f4a62fce9b%3A0xc99902aa1e26fda0!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBWxINuIExhbmcgLSBDxqEgc-G7nyAz!5e0!3m2!1svi!2s!4v1689255850020!5m2!1svi!2s"
                className="w-full h-[120px] md:h-[140px] grayscale hover:grayscale-0 transition-all duration-500"
                style={{ border: 0 }}
                loading="lazy"
                title="Map"
              ></iframe>
            </div>
          </motion.div>

        </div>

        {/* Copyright */}
        <div className="pt-6 md:pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs md:text-sm text-gray-500">
            © {new Date().getFullYear()} <span className="text-orange-500 font-bold">MTK FastFood</span>
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-gray-500 hover:text-orange-400 cursor-pointer">Điều khoản</span>
            <span className="text-gray-700">•</span>
            <span className="text-xs text-gray-500 hover:text-orange-400 cursor-pointer">Bảo mật</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;