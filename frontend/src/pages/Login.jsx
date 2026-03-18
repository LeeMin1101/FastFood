import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { SERVER_URL } from "../config";

const Login = ({ setUser }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedAccount = JSON.parse(localStorage.getItem("rememberAccount"));
    if (savedAccount) {
      setUsername(savedAccount.username);
      setPassword(savedAccount.password);
      setRemember(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${SERVER_URL}/api/auth/login`, {
        username,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      if (remember) {
        localStorage.setItem(
          "rememberAccount",
          JSON.stringify({ username, password })
        );
      } else {
        localStorage.removeItem("rememberAccount");
      }

      setShowSuccess(true);

      setTimeout(() => {
        if (user.role === "admin") navigate("/admin");
        else navigate("/");
      }, 1800);
    } catch (error) {
      setError(error.response?.data?.message || "Sai tên đăng nhập hoặc mật khẩu!");
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center text-white"
        >
          <motion.img
            src="/img/MTK.png"
            className="w-40 mx-auto mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1 }}
          />
          <h1 className="text-4xl font-black mb-2">
            Welcome to MTK FastFood
          </h1>
          <p className="text-orange-200">Redirecting...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-950 via-orange-900 to-red-900">

      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>

      {/* Floating Food Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="food">🍔</span>
        <span className="food">🍟</span>
        <span className="food">🌭</span>
        <span className="food">🍗</span>
        <span className="food">🥤</span>
      </div>

      <style>{`
        .food{
          position:absolute;
          font-size:28px;
          opacity:0.15;
          animation: floatFood 22s linear infinite;
        }

        .food:nth-child(1){ left:10%; animation-duration:18s;}
        .food:nth-child(2){ left:30%; animation-duration:24s;}
        .food:nth-child(3){ left:50%; animation-duration:20s;}
        .food:nth-child(4){ left:70%; animation-duration:26s;}
        .food:nth-child(5){ left:85%; animation-duration:22s;}

        @keyframes floatFood{
          0%{
            transform:translateY(110vh) rotate(0deg);
          }
          100%{
            transform:translateY(-120vh) rotate(360deg);
          }
        }
      `}</style>

      {/* Login Card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8">

          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src="/img/MTK.png"
              className="w-32 mx-auto mb-3 drop-shadow-xl"
            />
            <h1 className="text-3xl font-black text-white">
              MTK FastFood
            </h1>
            <p className="text-orange-200 text-sm">
              Đăng nhập để đặt món nhanh hơn 🍔
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-xl mb-4 text-sm">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 focus:border-orange-500 text-white px-4 py-3 rounded-xl outline-none"
            />

            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 focus:border-orange-500 text-white px-4 py-3 rounded-xl outline-none"
            />

            <div className="flex justify-between text-sm text-gray-300">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Ghi nhớ tôi
              </label>

              <Link
                to="/forgot-password"
                className="text-orange-300 hover:text-orange-200"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

          </form>

          <p className="text-center text-gray-300 text-sm mt-6">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-orange-300 font-bold"
            >
              Đăng ký
            </Link>
          </p>

        </div>
      </motion.div>

    </div>
  );
};

export default Login;