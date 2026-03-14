import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password mới
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Bước 1: Gửi Email nhận OTP
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true); setMessage(""); setError("");
    try {
      const res = await axios.post("https://mtk-fastfood.onrender.com/api/auth/forgot-password", { email });
      setMessage(res.data.message);
      setStep(2);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi gửi email!");
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 2: Xác nhận OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true); setMessage(""); setError("");
    try {
      const res = await axios.post("http://localhost:3000/api/auth/verify-otp", { email, otp });
      setMessage(res.data.message);
      setStep(3);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Mã OTP không hợp lệ.");
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 3: Đổi mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError("Mật khẩu nhập lại không khớp!");
    if (newPassword.length < 6) return setError("Mật khẩu phải có ít nhất 6 ký tự!");

    setIsLoading(true); setMessage(""); setError("");
    try {
      const res = await axios.post("http://localhost:3000/api/auth/reset-password", { email, otp, newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi đổi mật khẩu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA] font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        
        {/* STEP 1: NHẬP EMAIL */}
        {step === 1 && (
          <form onSubmit={handleSendEmail} className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 text-center text-slate-800">Quên mật khẩu? 🔒</h2>
            <p className="text-sm text-gray-500 mb-6 text-center font-medium">Nhập email đã đăng ký để nhận mã OTP</p>

            {message && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm font-medium rounded-lg text-center">{message}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">{error}</div>}

            <input type="email" required placeholder="Nhập địa chỉ Email..." className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FF4747] focus:ring-2 focus:ring-red-100 px-4 py-3 mb-6 rounded-xl outline-none transition-all text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit" disabled={isLoading} className="w-full bg-[#FF4747] hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-70">
              {isLoading ? "Đang gửi..." : "Gửi mã xác nhận"}
            </button>
          </form>
        )}

        {/* STEP 2: NHẬP OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 text-center text-slate-800">Nhập mã OTP 📩</h2>
            <p className="text-sm text-gray-500 mb-6 text-center font-medium">Mã 6 số đã được gửi tới <strong>{email}</strong></p>

            {message && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm font-medium rounded-lg text-center">{message}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">{error}</div>}

            <input type="text" required maxLength="6" placeholder="X X X X X X" className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FF4747] focus:ring-2 focus:ring-red-100 px-4 py-3 mb-6 rounded-xl outline-none transition-all font-bold text-center tracking-[1em] text-lg" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <button type="submit" disabled={isLoading} className="w-full bg-[#FF4747] hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-70">
              {isLoading ? "Đang kiểm tra..." : "Xác nhận mã OTP"}
            </button>
            <div className="text-center mt-4"><button type="button" onClick={() => setStep(1)} className="text-sm font-medium text-gray-400 hover:text-slate-800">Nhập lại Email khác</button></div>
          </form>
        )}

        {/* STEP 3: ĐỔI MẬT KHẨU */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 text-center text-slate-800">Tạo mật khẩu mới 🔑</h2>
            <p className="text-sm text-gray-500 mb-6 text-center font-medium">Vui lòng nhập mật khẩu mới cho tài khoản của bạn</p>

            {message && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm font-medium rounded-lg text-center">{message}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">{error}</div>}

            <input type="password" required placeholder="Mật khẩu mới (ít nhất 6 ký tự)" className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FF4747] focus:ring-2 focus:ring-red-100 px-4 py-3 mb-4 rounded-xl outline-none transition-all text-sm" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <input type="password" required placeholder="Nhập lại mật khẩu mới" className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FF4747] focus:ring-2 focus:ring-red-100 px-4 py-3 mb-6 rounded-xl outline-none transition-all text-sm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

            <button type="submit" disabled={isLoading} className="w-full bg-[#FF4747] hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-70">
              {isLoading ? "Đang xử lý..." : "Lưu mật khẩu mới"}
            </button>
          </form>
        )}

        {/* QUAY LẠI ĐĂNG NHẬP */}
        <div className="text-center mt-6 pt-4 border-t border-gray-100">
          <Link to="/login" className="text-sm text-gray-500 font-medium hover:text-[#FF4747] flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Quay lại đăng nhập
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;