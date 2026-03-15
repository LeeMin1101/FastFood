import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({}); // Lưu câu chửi cho từng ô
  const [apiError, setApiError] = useState("");

  const [formData, setFormData] = useState({
    name: "", username: "", email: "", phone: "", password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Nếu user chịu sửa thì tắt dòng chửi ở ô đó đi
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
    if (apiError) setApiError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = {};

    // 1. CHỬI TÊN ĐĂNG NHẬP (Không dấu, không khoảng cách, không ký tự đặc biệt)
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(formData.username)) {
      errors.username = "Nhập sai rồi ní ơi! Nhập dấu cách, ký tự đặc biệt với có dấu vào đây làm gì? Nghĩ cái form này là bãi rác à? Chỉ được nhập CHỮ KHÔNG DẤU VÀ SỐ thôi má!";
    }

    // 2. CHỬI MẬT KHẨU (>= 8 ký tự, không khoảng cách, không tiếng Việt có dấu)
    // Regex này chỉ cho phép các ký tự cơ bản trên bàn phím (mã ASCII từ 33 đến 126), cấm tiệt khoảng trắng (mã 32) và có dấu.
    const passwordRegex = /^[\x21-\x7E]+$/; 
    
    if (formData.password.length < 8) {
      errors.password = "Mật khẩu mà ngắn ngủn chưa tới 8 ký tự? Khinh thường hacker hả? Nhập dài ra giùm cái!";
    } else if (!passwordRegex.test(formData.password)) {
      errors.password = "Mật khẩu đẻ ra cái trò xài dấu cách với tiếng Việt có dấu làm gì? Tính làm khó Database hả? Xóa ngay, chỉ được nhập chữ không dấu, số và ký tự đặc biệt thôi!";
    }

    // Nếu lòi ra lỗi thì chặn không cho gọi API và hiện chửi
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await axios.post("https://fastfood-k8cr.onrender.com/api/auth/register", formData);
      alert("Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập.");
      navigate("/login");
    } catch (error) {
      setApiError(error.response?.data?.message || "Đăng ký thất bại rồi, coi lại ăn ở đi!");
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

        {apiError && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r shadow-sm animate-bounce">
            🤬 {apiError}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <input name="name" type="text" placeholder="Họ và tên" required onChange={handleChange} className="w-full border-2 bg-gray-50 px-4 py-3 rounded-xl outline-none transition-colors font-medium border-transparent focus:bg-white focus:border-red-400" />
          </div>
          
          <div>
            <input name="username" type="text" placeholder="Tên đăng nhập" required onChange={handleChange} className={`w-full border-2 bg-gray-50 px-4 py-3 rounded-xl outline-none transition-colors font-medium ${formErrors.username ? 'border-red-500 bg-red-50' : 'border-transparent focus:bg-white focus:border-red-400'}`} />
            {formErrors.username && <p className="text-red-600 text-xs mt-1.5 font-bold px-1 animate-pulse">🤬 {formErrors.username}</p>}
          </div>
          
          <div>
            <input name="phone" type="tel" placeholder="Số điện thoại" required onChange={handleChange} className="w-full border-2 bg-gray-50 px-4 py-3 rounded-xl outline-none transition-colors font-medium border-transparent focus:bg-white focus:border-red-400" />
          </div>
          
          <div>
            <input name="email" type="email" placeholder="Email" required onChange={handleChange} className="w-full border-2 bg-gray-50 px-4 py-3 rounded-xl outline-none transition-colors font-medium border-transparent focus:bg-white focus:border-red-400" />
          </div>
          
          <div>
            <input name="password" type="password" placeholder="Mật khẩu" required onChange={handleChange} className={`w-full border-2 bg-gray-50 px-4 py-3 rounded-xl outline-none transition-colors font-medium ${formErrors.password ? 'border-red-500 bg-red-50' : 'border-transparent focus:bg-white focus:border-red-400'}`} />
            {formErrors.password && <p className="text-red-600 text-xs mt-1.5 font-bold px-1 animate-pulse">🤬 {formErrors.password}</p>}
          </div>

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