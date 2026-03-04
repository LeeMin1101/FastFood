import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t-[6px] border-orange-500 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="space-y-4">
            <Link to="/" className="text-3xl font-extrabold text-white flex items-center gap-2 mb-6">
              <span className="text-4xl">🍔</span> FastFood
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Trao gửi hương vị thơm ngon trong từng món ăn. Giao hàng thần tốc 30 phút, đảm bảo món ăn luôn nóng hổi khi đến tay bạn.
            </p>
            {/* Mạng xã hội */}
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
            </div>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Khám Phá</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="hover:text-orange-500 transition">Về chúng tôi</Link></li>
              <li><Link to="/menu" className="hover:text-orange-500 transition">Thực đơn nổi bật</Link></li>
              <li><Link to="/promotions" className="hover:text-orange-500 transition">Khuyến mãi cực hot</Link></li>
              <li><Link to="/careers" className="hover:text-orange-500 transition">Tuyển dụng</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ khách hàng */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Hỗ Trợ</h3>
            <ul className="space-y-3">
              <li><Link to="/faq" className="hover:text-orange-500 transition">Câu hỏi thường gặp (FAQ)</Link></li>
              <li><Link to="/shipping" className="hover:text-orange-500 transition">Chính sách giao hàng</Link></li>
              <li><Link to="/returns" className="hover:text-orange-500 transition">Chính sách đổi trả</Link></li>
              <li><Link to="/privacy" className="hover:text-orange-500 transition">Bảo mật thông tin</Link></li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ & Đăng ký */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Liên Hệ</h3>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <span className="text-orange-500 text-xl">📞</span>
                <span>Hotline: <br/><strong className="text-white">0774.155.497</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 text-xl">📧</span>
                <span>hoitruongzero@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
              <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.7878687793996!2d106.70002579999999!3d10.827539600000001!2m3!1f0!2f0!2f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528f4a62fce9b%3A0xc99902aa1e26ef02!2sVan%20Lang%20University%20-%20Main%20Campus!5e0!3m2!1sen!2s!4v1772497923786!5m2!1sen!2s"
                  width="700"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Van Lang University Map"
                ></iframe>
              </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Phần Dưới Cùng (Bottom Footer) */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} FastFood. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex gap-2">
            {/* Các icon thanh toán giả lập */}
            <span className="px-3 py-1 bg-gray-800 rounded-md text-xs font-bold text-white border border-gray-700">VNPay</span>
            <span className="px-3 py-1 bg-gray-800 rounded-md text-xs font-bold text-white border border-gray-700">Momo</span>
            <span className="px-3 py-1 bg-gray-800 rounded-md text-xs font-bold text-white border border-gray-700">Visa / Master</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;