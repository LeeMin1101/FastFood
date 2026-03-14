import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // State để lưu mấy câu chửi
  const [formData, setFormData] = useState({
    name: "", username: "", email: "", phone: "", password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Tắt chửi đi khi user ngoan ngoãn bắt đầu gõ lại
    if (errorMsg) setErrorMsg(""); 
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. RÀNG BUỘC TÊN ĐĂNG NHẬP: Bắt buộc chỉ là chữ (a-z, A-Z) và số (0-9)
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    
    if (!usernameRegex.test(formData.username)) {
      setErrorMsg("Ê cái tay! Tên đăng nhập mà xài dấu cách, ký tự đặc biệt với có dấu hả? Nghĩ cái form này là bãi rác à? Chỉ được dùng CHỮ KHÔNG DẤU VÀ SỐ thôi má!");
      return; // Chặn luôn, không cho gọi API
    }

    // 2. RÀNG BUỘC MẬT KHẨU
    if (formData.password.length < 6) {
      setErrorMsg("Cái mật khẩu ngắn tũn vầy chó nó cũng hack được! Nhập ít nhất 6 ký tự vào lẹ lên!");
      return;
    }

    setLoading(true);
    try {
      await axios.post("https://mtk-fastfood.onrender.com/api/auth/register", formData);
      alert("Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập.");
      navigate("/login");
    } catch (error) {
      // Bắt lỗi từ Backend (ví dụ trùng email, trùng username)
      setErrorMsg(error.response?.data?.message || "Đăng ký thất bại rồi, coi lại ăn ở đi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center font-sans"
      style={{ backgroundImage: "url('/img/bg_vlu.jpg')" }}
    >
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 my-10">
        <h2 className="text-3xl font-black mb-6 text-center text-gray-800">Tạo tài khoản</h2>

        {/* --- KHU VỰC HIỂN THỊ CÂU CHỬI --- */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r shadow-sm animate-bounce">
            🤬 {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <input name="name" type="text" placeholder="Họ và tên" required onChange={handleChange} className="w-full border-2 border-transparent bg-gray-50 px-4 py-3 rounded-xl focus:bg-white focus:border-red-400 outline-none transition-colors font-medium" />
          
          <input name="username" type="text" placeholder="Tên đăng nhập (Điền sai mẹ rồi điền lại đi, chỉ được điền chữ và số, không cho phép có dấu và dấu cách!)" required onChange={handleChange} className="w-full border-2 border-transparent bg-gray-50 px-4 py-3 rounded-xl focus:bg-white focus:border-red-400 outline-none transition-colors font-medium" />
          
          <input name="phone" type="tel" placeholder="Số điện thoại" required onChange={handleChange} className="w-full border-2 border-transparent bg-gray-50 px-4 py-3 rounded-xl focus:bg-white focus:border-red-400 outline-none transition-colors font-medium" />
          
          <input name="email" type="email" placeholder="Email" required onChange={handleChange} className="w-full border-2 border-transparent bg-gray-50 px-4 py-3 rounded-xl focus:bg-white focus:border-red-400 outline-none transition-colors font-medium" />
          
          <input name="password" type="password" placeholder="Mật khẩu" required onChange={handleChange} className="w-full border-2 border-transparent bg-gray-50 px-4 py-3 rounded-xl focus:bg-white focus:border-red-400 outline-none transition-colors font-medium" />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3.5 rounded-xl font-black text-lg hover:shadow-lg hover:shadow-red-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? "Đang xử lý..." : "Đăng ký ngay"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600 font-medium">
          Đã có tài khoản? <Link to="/login" className="text-red-500 font-bold hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;