import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios"; 

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

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

    try {
      // 1️⃣ GỌI API XUỐNG BACKEND ĐỂ ĐĂNG NHẬP THẬT
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        username,
        password,
      });

      // 2️⃣ LẤY TOKEN VÀ USER TỪ BACKEND TRẢ VỀ
      const { token, user } = response.data;

      // 3️⃣ LƯU VÀO LOCAL STORAGE (Đây là bước quan trọng nhất để Admin thấy dữ liệu)
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      setUser(user);

      if (remember) {
        localStorage.setItem("rememberAccount", JSON.stringify({ username, password }));
      } else {
        localStorage.removeItem("rememberAccount");
      }

      // 4️⃣ CHUYỂN HƯỚNG DỰA TRÊN QUYỀN TRONG DATABASE
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (error) {
      alert(error.response?.data?.message || "Sai tên đăng nhập hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url(img/bg_vlu.jpg)" }}>
      <form onSubmit={handleLogin} className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-96 border border-white/20">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 tracking-tight">Đăng nhập</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Tên đăng nhập</label>
            <input type="text" placeholder="Nhập username của bạn" className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-400 outline-none transition-all" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Mật khẩu</label>
            <input type="password" placeholder="••••••••" className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-400 outline-none transition-all" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        </div>

        <div className="flex items-center justify-between my-5 text-sm">
          <label className="flex items-center gap-2 cursor-pointer text-gray-600">
            <input type="checkbox" className="w-4 h-4 accent-red-500" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Ghi nhớ tôi
          </label>
          <Link to="/forgot-password" size className="text-red-500 font-medium transition">Quên mật khẩu?</Link>
        </div>

        <button type="submit" disabled={loading} className={`w-full text-white font-bold py-3 rounded-xl transition-all duration-200 ${loading ? "bg-gray-400" : "bg-gradient-to-r from-red-500 to-orange-500 hover:shadow-lg hover:scale-[1.02] active:scale-95"}`}>
          {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
        </button>

        <div className="text-center mt-6 text-gray-600 text-sm">
          Bạn chưa có tài khoản? <Link to="/register" className="text-red-500 font-bold hover:underline ml-1">Đăng ký</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;