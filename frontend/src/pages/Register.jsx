import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { SERVER_URL } from "../config";

const Register = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }

    if (apiError) setApiError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const errors = {};

    // Username: chỉ chữ không dấu và số
    const usernameRegex = /^[a-zA-Z0-9]+$/;

    if (!usernameRegex.test(formData.username)) {
      errors.username =
        "Nhập cái tên đăng nhập gì kỳ vậy má? Không dấu, không khoảng cách, không ký tự đặc biệt! Chỉ được dùng chữ không dấu với số thôi!";
    }

    // Password: >=8 ký tự và chỉ chữ + số
    const passwordRegex = /^[a-zA-Z0-9]+$/;

    if (formData.password.length < 8) {
      errors.password =
        "Mật khẩu ngắn ngủn vậy mà cũng nhập? Tối thiểu phải 8 ký tự nha!";
    } else if (!passwordRegex.test(formData.password)) {
      errors.password =
        "Mật khẩu chỉ được chữ và số thôi! Bày đặt ký tự lạ làm gì cho mệt hệ thống!";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${SERVER_URL}/api/auth/register`, formData);

      alert("Đăng ký thành công!");
      navigate("/login");
    } catch (error) {
      setApiError(error.response?.data?.message || "Đăng ký thất bại rồi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 relative overflow-hidden">

      {/* floating food */}
      <div className="absolute bottom-6 left-10 opacity-20 text-3xl animate-bounce">🍔</div>
      <div className="absolute bottom-10 right-16 opacity-20 text-3xl animate-bounce">🌭</div>
      <div className="absolute bottom-14 left-1/3 opacity-20 text-3xl animate-bounce">🍟</div>
      <div className="absolute bottom-4 right-1/3 opacity-20 text-3xl animate-bounce">🥤</div>

      {/* card */}
      <div className="w-[420px] backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-10 shadow-2xl">

        {/* logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/img/MTK.png"
            alt="MTK"
            className="w-44 md:w-52 drop-shadow-2xl hover:scale-105 transition"
          />
        </div>

        <p className="text-center text-gray-200 mb-6">
          Tạo tài khoản để đặt món nhanh hơn 🍔
        </p>

        {apiError && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 text-sm p-3 rounded-lg mb-4">
            ⚠️ {apiError}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">

          <input
            type="text"
            name="name"
            placeholder="Họ và tên"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:border-orange-400"
          />

          {/* USERNAME */}
          <input
            type="text"
            name="username"
            placeholder="Tên đăng nhập"
            value={formData.username}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 rounded-xl bg-white/10 border text-white placeholder-gray-300 focus:outline-none ${
              formErrors.username
                ? "border-red-500 bg-red-500/20"
                : "border-white/20 focus:border-orange-400"
            }`}
          />

          {formErrors.username && (
            <p className="text-red-200 text-xs font-bold animate-pulse">
              🤬 {formErrors.username}
            </p>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:border-orange-400"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:border-orange-400"
          />

          {/* PASSWORD */}
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 rounded-xl bg-white/10 border text-white placeholder-gray-300 focus:outline-none ${
              formErrors.password
                ? "border-red-500 bg-red-500/20"
                : "border-white/20 focus:border-orange-400"
            }`}
          />

          {formErrors.password && (
            <p className="text-red-200 text-xs font-bold animate-pulse">
              🤬 {formErrors.password}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:opacity-90 transition"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="text-center text-gray-300 mt-6">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-orange-300 font-semibold hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;