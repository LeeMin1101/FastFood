import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const { id, token } = useParams(); // Lấy ID và Token từ URL
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Mật khẩu nhập lại không khớp!");
    }
    if (password.length < 6) {
      return setError("Mật khẩu phải có ít nhất 6 ký tự!");
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(`http://localhost:3000/api/auth/reset-password/${id}/${token}`, { password });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 3000); // Tự động về trang đăng nhập sau 3s
    } catch (err) {
      setError(err.response?.data?.message || "Link đã hết hạn hoặc không hợp lệ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-md">
        <h2 className="text-2xl font-black mb-2 text-center text-slate-800">Tạo mật khẩu mới 🔑</h2>
        <p className="text-sm text-gray-500 mb-6 text-center font-medium">Vui lòng nhập mật khẩu mới cho tài khoản của bạn</p>

        {message && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm font-bold rounded-xl text-center border border-green-200">{message} Đang chuyển hướng...</div>}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center border border-red-200">{error}</div>}

        <input type="password" required placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
          className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#FF4747] px-4 py-3 mb-4 rounded-xl outline-none transition-all font-medium"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />

        <input type="password" required placeholder="Nhập lại mật khẩu mới"
          className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#FF4747] px-4 py-3 mb-6 rounded-xl outline-none transition-all font-medium"
          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-orange-500 to-[#FF4747] hover:shadow-lg hover:shadow-red-500/30 text-white font-black py-3.5 rounded-xl transition-all disabled:opacity-70">
          {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </button>

        <div className="text-center mt-6 text-sm">
          <Link to="/login" className="text-gray-500 font-bold hover:text-[#FF4747]">Đăng nhập bằng tài khoản cũ</Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;