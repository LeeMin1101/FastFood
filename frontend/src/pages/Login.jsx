import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { SERVER_URL } from "../config";

const Login = ({ setUser }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  // Load remembered account
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("rememberAccount"));
    if (saved) {
      setForm(saved);
      setRemember(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${SERVER_URL}/api/auth/login`, form);

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      if (remember) {
        localStorage.setItem("rememberAccount", JSON.stringify(form));
      } else {
        localStorage.removeItem("rememberAccount");
      }

      setShowSuccess(true);

      setTimeout(() => {
        user.role === "admin" ? navigate("/admin") : navigate("/");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Sai tên đăng nhập hoặc mật khẩu!"
      );
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (showSuccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-red-600 to-orange-500">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center text-white"
        >
          <h1 className="text-4xl font-bold mb-3">
            🎉 Đăng nhập thành công!
          </h1>
          <p>Đang chuyển hướng...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-500 to-yellow-400 flex items-center justify-center px-4">

      <div className="grid lg:grid-cols-2 gap-10 max-w-6xl w-full">

        {/* LEFT - BRANDING */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden lg:block text-white"
        >
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            MTK FastFood 🍔
          </h1>

          <p className="text-xl mb-6">
            Nhanh - Nóng - Ngon mỗi ngày
          </p>

          <ul className="space-y-3 text-lg">
            <li>✅ Giao hàng 30 phút</li>
            <li>✅ Ưu đãi thành viên</li>
            <li>✅ Tích điểm đổi quà</li>
          </ul>
        </motion.div>

        {/* RIGHT - FORM */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-6">
            Đăng Nhập
          </h2>

          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block mb-1 text-gray-600">
                Tên đăng nhập
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:border-red-500"
                  placeholder="Nhập username..."
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 text-gray-600">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:border-red-500"
                  placeholder="••••••"
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Ghi nhớ
              </label>

              <Link
                to="/forgot-password"
                className="text-red-500 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 rounded-xl font-bold hover:opacity-90 transition"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </motion.button>
          </form>

          {/* Register */}
          <p className="text-center text-sm mt-6">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-red-500 font-bold">
              Đăng ký
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;