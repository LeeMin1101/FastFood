import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from '@react-oauth/google'; // 👉 IMPORT GOOGLE LOGIN
import { SERVER_URL } from "../config";
import "../styles/auth.css";

const AuthPage = ({ setUser }) => {
  const navigate = useNavigate();
  // State quyết định hiển thị Login (true) hay Register (false)
  const [isLogin, setIsLogin] = useState(true);

  // ================== LOGIN STATE ==================
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // ================== REGISTER STATE ==================
  const [registerData, setRegisterData] = useState({
    name: "", username: "", email: "", phone: "", password: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerFormErrors, setRegisterFormErrors] = useState({});

  // ================== USE EFFECT ==================
  useEffect(() => {
    const savedAccount = JSON.parse(localStorage.getItem("rememberAccount"));
    if (savedAccount) {
      setLoginData(savedAccount);
      setRemember(true);
    }
  }, []);

  // ================== GOOGLE LOGIN HANDLER (NEW) ==================
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoginLoading(true);
      // Gửi token Google xuống Backend để xác thực và tạo/lấy JWT của hệ thống
      const response = await axios.post(`${SERVER_URL}/api/auth/google`, {
        credential: credentialResponse.credential
      });

      const { token, user } = response.data;
      
      // Lưu token và user info
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      // Hiển thị màn hình chào mừng
      setShowSuccess(true);
      setTimeout(() => {
        if (user.role === "admin") navigate("/admin");
        else navigate("/");
      }, 1800);

    } catch (error) {
      console.error("Lỗi Google Login:", error);
      setLoginError("Đăng nhập Google thất bại. Vui lòng thử lại!");
      setLoginLoading(false);
    }
  };

  // ================== LOGIN HANDLERS ==================
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (loginError) setLoginError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const response = await axios.post(`${SERVER_URL}/api/auth/login`, {
        username: loginData.username,
        password: loginData.password,
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      if (remember) {
        localStorage.setItem("rememberAccount", JSON.stringify({ username: loginData.username, password: loginData.password }));
      } else {
        localStorage.removeItem("rememberAccount");
      }

      setShowSuccess(true);
      setTimeout(() => {
        if (user.role === "admin") navigate("/admin");
        else navigate("/");
      }, 1800);
    } catch (error) {
      setLoginError(error.response?.data?.message || "Sai tên đăng nhập hoặc mật khẩu!");
      setLoginLoading(false);
    }
  };

  // ================== REGISTER HANDLERS ==================
  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    if (registerFormErrors[e.target.name]) {
      setRegisterFormErrors({ ...registerFormErrors, [e.target.name]: "" });
    }
    if (registerError) setRegisterError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = {};

    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(registerData.username)) {
      errors.username = "Nhập cái tên đăng nhập gì kỳ vậy má? Không dấu, không khoảng cách, không ký tự đặc biệt! Chỉ được dùng chữ không dấu với số thôi!";
    }

    const passwordRegex = /^[a-zA-Z0-9]+$/;
    if (registerData.password.length < 8) {
      errors.password = "Mật khẩu ngắn ngủn vậy mà cũng nhập? Tối thiểu phải 8 ký tự nha!";
    } else if (!passwordRegex.test(registerData.password)) {
      errors.password = "Mật khẩu chỉ được chữ và số thôi! Bày đặt ký tự lạ làm gì cho mệt hệ thống!";
    }

    if (Object.keys(errors).length > 0) {
      setRegisterFormErrors(errors);
      return;
    }

    setRegisterLoading(true);

    try {
      await axios.post(`${SERVER_URL}/api/auth/register`, registerData);
      alert("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
      
      // Chuyển sang form Login và xóa data form đăng ký
      setRegisterData({ name: "", username: "", email: "", phone: "", password: "" });
      setIsLogin(true);
    } catch (error) {
      setRegisterError(error.response?.data?.message || "Đăng ký thất bại rồi!");
    } finally {
      setRegisterLoading(false);
    }
  };

  // ================== SUCCESS SCREEN ==================
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 flex items-center justify-center z-50">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center text-white">
          <motion.img src="/img/MTK.png" className="w-40 mx-auto mb-6" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1 }} />
          <h1 className="text-4xl font-black mb-2">Welcome to MTK FastFood</h1>
          <p className="text-orange-200">Redirecting...</p>
        </motion.div>
      </div>
    );
  }

  // ================== MAIN AUTH PAGE ==================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-orange-900 to-red-900 relative overflow-hidden py-10">
      
      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>

      {/* Floating Food Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="food">🍔</span><span className="food">🍟</span><span className="food">🌭</span><span className="food">🍗</span><span className="food">🥤</span>
      </div>

      <style>{`
        .food{ position:absolute; font-size:28px; opacity:0.15; animation: floatFood 22s linear infinite; }
        .food:nth-child(1){ left:10%; animation-duration:18s;}
        .food:nth-child(2){ left:30%; animation-duration:24s;}
        .food:nth-child(3){ left:50%; animation-duration:20s;}
        .food:nth-child(4){ left:70%; animation-duration:26s;}
        .food:nth-child(5){ left:85%; animation-duration:22s;}
        @keyframes floatFood{ 0%{ transform:translateY(110vh) rotate(0deg); } 100%{ transform:translateY(-120vh) rotate(360deg); } }
      `}</style>

      {/* ======================================================= */}
      {/* KHUNG MAIN CHỨA 2 NỬA - TỰ ĐỘNG SWAP VỊ TRÍ KHI CLICK */}
      {/* ======================================================= */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
        <motion.div 
          layout // Phép màu của Framer Motion nằm ở đây
          className="flex flex-col lg:flex-row bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden min-h-[600px]"
        >
          
          {/* ----- NỬA 1: LOGO & BRANDING ----- */}
          {/* Nếu isLogin = true thì xếp nó ở vị trí số 1 (Bên Trái). Nếu false thì xếp ở vị trí 2 (Bên Phải) */}
          <motion.div 
            layout 
            className={`hidden lg:flex w-full lg:w-1/2 p-12 flex-col items-center justify-center bg-white/5 transition-all duration-700 ${isLogin ? 'order-1 border-r border-white/10' : 'order-2 border-l border-white/10'}`}
          >
            <motion.img src="/img/MTK.png" alt="MTK FastFood Logo" className="w-64 h-64 mb-8 drop-shadow-2xl" animate={{ y: [0, -20, 0] }} transition={{ duration: 3, repeat: Infinity }} />
            <p className="text-orange-200 text-lg text-center">
            </p>
            <div className="mt-8 space-y-4 text-white/70 text-center font-medium">
              <p>✨ Thức ăn tươi ngon</p>
              <p>⚡ Giao hàng siêu tốc</p>
              <p>💳 Thanh toán an toàn</p>
            </div>
          </motion.div>


          {/* ----- NỬA 2: FORM ĐIỀN THÔNG TIN ----- */}
          {/* Ngược lại với Logo, hoán đổi thứ tự tương ứng */}
          <motion.div 
            layout 
            className={`w-full lg:w-1/2 p-8 sm:p-12 relative flex items-center justify-center ${isLogin ? 'order-2' : 'order-1'}`}
          >
            <AnimatePresence mode="wait">
              {isLogin ? (
                // =============== FORM ĐĂNG NHẬP =================
                <motion.div 
                  key="login"
                  initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }}
                  className="w-full max-w-md"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-black text-white mb-2">Đăng nhập</h2>
                    <p className="text-orange-200 text-sm">Đăng nhập để đặt món nhanh hơn 🍔</p>
                  </div>

                  {loginError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-xl mb-4 text-sm">
                      ⚠ {loginError}
                    </motion.div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    <input type="text" name="username" placeholder="Tên đăng nhập" value={loginData.username} onChange={handleLoginChange} required className="w-full bg-white/10 border border-white/20 focus:border-orange-500 text-white px-4 py-3 rounded-xl outline-none placeholder-gray-400 transition" />
                    <input type="password" name="password" placeholder="Mật khẩu" value={loginData.password} onChange={handleLoginChange} required className="w-full bg-white/10 border border-white/20 focus:border-orange-500 text-white px-4 py-3 rounded-xl outline-none placeholder-gray-400 transition" />

                    <div className="flex justify-between text-sm text-gray-300">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="cursor-pointer" /> Ghi nhớ tôi
                      </label>
                      <a href="/forgot-password" className="text-orange-300 hover:text-orange-200 transition">Quên mật khẩu?</a>
                    </div>

                    <button type="submit" disabled={loginLoading} className="w-full py-3.5 rounded-xl font-bold text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition disabled:opacity-50 mt-4 shadow-lg shadow-red-500/20">
                      {loginLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                  </form>

                  {/* 👉 NÚT GOOGLE LOGIN Ở ĐÂY */}
                  <div className="mt-6 flex flex-col items-center">
                    <div className="w-full flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-white/10"></div>
                      <span className="text-gray-400 text-sm">Hoặc</span>
                      <div className="flex-1 h-px bg-white/10"></div>
                    </div>
                    
                    <div className="w-full flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                          console.error('Google Login Failed');
                          setLoginError("Lỗi kết nối Google. Vui lòng thử lại!");
                        }}
                        theme="outline"
                        size="large"
                        text="signin_with"
                        shape="rectangular"
                      />
                    </div>
                  </div>

                  <p className="text-center text-gray-300 text-sm mt-8">
                    Chưa có tài khoản?{" "}
                    <button onClick={() => setIsLogin(false)} className="text-orange-400 font-black hover:text-orange-300 transition hover:underline">
                      Đăng ký ngay
                    </button>
                  </p>
                </motion.div>

              ) : (

                // Đăng Ký
                <motion.div 
                  key="register"
                  initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.4 }}
                  className="w-full max-w-md"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-black text-white mb-2">Tạo Tài Khoản</h2>
                    <p className="text-orange-200 text-sm">Tham gia đại gia đình MTK ngay hôm nay 🌭</p>
                  </div>

                  {registerError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/20 border border-red-400 text-red-200 text-sm p-3 rounded-xl mb-4">
                      ⚠️ {registerError}
                    </motion.div>
                  )}

                  {/*NÚT GOOGLE ĐĂNG KÝ NHANH Ở ĐÂY */}
                  <div className="mb-4 flex flex-col items-center">
                     <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                          console.error('Google Register Failed');
                          setRegisterError("Lỗi kết nối Google. Vui lòng thử lại!");
                        }}
                        theme="outline"
                        size="large"
                        text="signup_with"
                        shape="rectangular"
                      />
                      
                      <div className="w-full flex items-center gap-3 mt-4 mb-2">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="text-gray-400 text-xs uppercase tracking-widest">Đăng ký thủ công</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                      </div>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-3">
                    <input type="text" name="name" placeholder="Họ và tên" value={registerData.name} onChange={handleRegisterChange} required className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 transition" />
                    
                    <input type="text" name="username" placeholder="Tên đăng nhập" value={registerData.username} onChange={handleRegisterChange} required className={`w-full px-4 py-3 rounded-xl bg-white/10 border text-white placeholder-gray-400 focus:outline-none transition ${registerFormErrors.username ? "border-red-500 bg-red-500/20" : "border-white/20 focus:border-orange-400"}`} />
                    {registerFormErrors.username && <p className="text-red-200 text-xs font-bold px-1 animate-pulse">🤬 {registerFormErrors.username}</p>}

                    <div className="grid grid-cols-2 gap-3">
                      <input type="email" name="email" placeholder="Email" value={registerData.email} onChange={handleRegisterChange} required className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 transition" />
                      <input type="tel" name="phone" placeholder="Số điện thoại" value={registerData.phone} onChange={handleRegisterChange} required className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 transition" />
                    </div>

                    <input type="password" name="password" placeholder="Mật khẩu" value={registerData.password} onChange={handleRegisterChange} required className={`w-full px-4 py-3 rounded-xl bg-white/10 border text-white placeholder-gray-400 focus:outline-none transition ${registerFormErrors.password ? "border-red-500 bg-red-500/20" : "border-white/20 focus:border-orange-400"}`} />
                    {registerFormErrors.password && <p className="text-red-200 text-xs font-bold px-1 animate-pulse">🤬 {registerFormErrors.password}</p>}

                    <button type="submit" disabled={registerLoading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg hover:opacity-90 transition disabled:opacity-50 mt-4 shadow-lg shadow-red-500/20">
                      {registerLoading ? "Đang đăng ký..." : "Đăng ký tài khoản"}
                    </button>
                  </form>

                  <p className="text-center text-gray-300 text-sm mt-6">
                    Đã có tài khoản?{" "}
                    <button onClick={() => setIsLogin(true)} className="text-orange-400 font-black hover:text-orange-300 transition hover:underline">
                      Quay lại Đăng nhập
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;