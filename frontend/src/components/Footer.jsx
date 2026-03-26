import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-t from-gray-950 via-gray-900 to-gray-900 text-gray-300 pt-16 pb-8 border-t border-white/10 mt-20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Branding Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <Link to="/" className="text-3xl font-extrabold text-white flex items-center gap-2 mb-6 group">
              <span className="text-4xl transform group-hover:scale-110 transition-transform">🍔</span> 
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">FastFood</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Trao gửi hương vị thơm ngon trong từng món ăn. Giao hàng thần tốc 30 phút, đảm bảo món ăn luôn nóng hổi khi đến tay bạn.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              <motion.a 
                whileHover={{ scale: 1.1, backgroundColor: "rgba(249, 115, 22, 0.8)" }}
                href="#" 
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:text-white transition duration-300 border border-white/10"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.1, backgroundColor: "rgba(249, 115, 22, 0.8)" }}
                href="#" 
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:text-white transition duration-300 border border-white/10"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </motion.a>
            </div>
          </motion.div>

          {/* Explore Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Khám Phá</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-400 hover:text-orange-400 transition duration-200">Về chúng tôi</Link></li>
              <li><Link to="/menu" className="text-gray-400 hover:text-orange-400 transition duration-200">Thực đơn nổi bật</Link></li>
              <li><Link to="/promotions" className="text-gray-400 hover:text-orange-400 transition duration-200">Khuyến mãi cực hot</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-orange-400 transition duration-200">Tuyển dụng</Link></li>
            </ul>
          </motion.div>

          {/* Support Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Hỗ Trợ</h3>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-gray-400 hover:text-orange-400 transition duration-200">Câu hỏi thường gặp (FAQ)</Link></li>
              <li><Link to="/shipping" className="text-gray-400 hover:text-orange-400 transition duration-200">Chính sách giao hàng</Link></li>
              <li><Link to="/returns" className="text-gray-400 hover:text-orange-400 transition duration-200">Chính sách đổi trả</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-orange-400 transition duration-200">Bảo mật thông tin</Link></li>
            </ul>
          </motion.div>

          {/* Contact Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Liên Hệ</h3>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3 group">
                <span className="text-orange-500 text-xl group-hover:scale-125 transition-transform">📞</span>
                <span className="text-gray-400 group-hover:text-orange-400 transition duration-200">Hotline: <br/><strong className="text-white">0774.155.497</strong></span>
              </li>
              <li className="flex items-start gap-3 group">
                <span className="text-orange-500 text-xl group-hover:scale-125 transition-transform">📧</span>
                <span className="text-gray-400 group-hover:text-orange-400 transition duration-200">hoitruongzero@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
              <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.7878687793996!2d106.70002579999999!3d10.827539600000001!2m3!1f0!2f0!2f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528f4a62fce9b%3A0xc99902aa1e26ef02!2sVan%20Lang%20University%20-%20Main%20Campus!5e0!3m2!1sen!2s!4v1772497923786!5m2!1sen!2s"
                  width="600"
                  height="200"
                  style={{ border: 0, borderRadius: "12px" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Van Lang University Map"
                ></iframe>
              </div>
              </li>
            </ul>
          </motion.div>

        </div>

        {/* Bottom Footer with Glass Effect */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 backdrop-blur-sm rounded-2xl px-6 py-4"
        >
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} FastFood. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex gap-2 flex-wrap justify-center md:justify-end">
            <motion.span 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(249, 115, 22, 0.2)" }}
              className="px-3 py-1 bg-white/10 rounded-md text-xs font-bold text-orange-400 border border-orange-500/30 hover:border-orange-500 transition duration-200 cursor-pointer"
            >
              VNPay
            </motion.span>
            <motion.span 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(249, 115, 22, 0.2)" }}
              className="px-3 py-1 bg-white/10 rounded-md text-xs font-bold text-orange-400 border border-orange-500/30 hover:border-orange-500 transition duration-200 cursor-pointer"
            >
              Momo
            </motion.span>
            <motion.span 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(249, 115, 22, 0.2)" }}
              className="px-3 py-1 bg-white/10 rounded-md text-xs font-bold text-orange-400 border border-orange-500/30 hover:border-orange-500 transition duration-200 cursor-pointer"
            >
              Visa / Master
            </motion.span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;