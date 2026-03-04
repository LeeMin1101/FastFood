import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", username: "", email: "", phone: "", password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/api/auth/register", formData);
      alert("Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/img/bg_vlu.jpg')" }}
    >
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 my-10">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Tạo tài khoản</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <input name="name" type="text" placeholder="Họ và tên" required onChange={handleChange} className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-400 outline-none" />
          <input name="username" type="text" placeholder="Tên đăng nhập" required onChange={handleChange} className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-400 outline-none" />
          <input name="phone" type="tel" placeholder="Số điện thoại" required onChange={handleChange} className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-400 outline-none" />
          <input name="email" type="email" placeholder="Email" required onChange={handleChange} className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-400 outline-none" />
          <input name="password" type="password" placeholder="Mật khẩu" required onChange={handleChange} className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-400 outline-none" />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-red-600 shadow-lg transition transform active:scale-95"
          >
            {loading ? "Đang xử lý..." : "Đăng ký ngay"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Đã có tài khoản? <Link to="/login" className="text-red-500 font-bold hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;