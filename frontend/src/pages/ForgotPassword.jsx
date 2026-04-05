import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { SERVER_URL } from "../config";

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true); 
    setMessage(""); 
    setError("");

    try {
      const res = await axios.post(`${SERVER_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.message);
      // Giữ nguyên ở Bước 1 vì hệ thống mới chỉ gửi thẳng mật khẩu vào Email
      // Nếu bạn muốn hiển thị thông báo thành công và chuyển về trang đăng nhập:
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi gửi email!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true); 
    setMessage(""); 
    setError("");

    try {
      const res = await axios.post(`${SERVER_URL}/api/auth/verify-otp`, { email, otp });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Mã OTP không hợp lệ.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError("Mật khẩu nhập lại không khớp!");
    if (newPassword.length < 6) return setError("Mật khẩu phải có ít nhất 6 ký tự!");

    setIsLoading(true); 
    setMessage(""); 
    setError("");

    try {
      const res = await axios.post(`${SERVER_URL}/api/auth/reset-password`, { email, otp, newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi đổi mật khẩu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 flex overflow-hidden animate-fadeIn">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        .input-field {
          position: relative;
          transition: all 0.3s ease;
        }
        .input-field input {
          padding-left: 45px;
        }
        .input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          transition: color 0.3s ease;
        }
        .input-field input:focus ~ .input-icon,
        .input-field input:not(:placeholder-shown) ~ .input-icon {
          color: #f97316;
        }
      `}</style>

      {/* Left Marketing Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: "1s" }}></div>

        <div className="relative z-10">
          <div className="text-white animate-slideUp">
            <div className="flex items-center mb-8">
              <motion.img
                src="/img/MTK.png"
                alt="MTK Logo"
                className="w-28 md:w-36 lg:w-44 h-auto object-contain drop-shadow-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <h2 className="text-5xl font-black mb-4 leading-tight">Đặt đồ ăn chưa bao giờ dễ đến thế</h2>
            <p className="text-xl text-orange-100 mb-6">Nhanh chóng – Tiện lợi – Ngon miệng</p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white text-center animate-slideUp" style={{ animationDelay: "0.2s" }}>
            <div className="text-3xl mb-2">⚡</div>
            <p className="font-bold">Giao nhanh</p>
            <p className="text-sm text-orange-100">30 phút</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white text-center animate-slideUp" style={{ animationDelay: "0.4s" }}>
            <div className="text-3xl mb-2">🍔</div>
            <p className="font-bold">Nóng hổi</p>
            <p className="text-sm text-orange-100">Tươi mới</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white text-center animate-slideUp" style={{ animationDelay: "0.6s" }}>
            <div className="text-3xl mb-2">💰</div>
            <p className="font-bold">Giá rẻ</p>
            <p className="text-sm text-orange-100">Hợp lý</p>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-slideUp">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <motion.img
              src="/img/MTK.png"
              alt="MTK Logo"
              className="w-14 h-auto object-contain"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            />
            <h1 className="text-2xl font-black text-white">MTK</h1>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            {step === 1 && (
              <motion.form 
                onSubmit={handleSendEmail}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-3xl font-black text-white mb-2">Quên mật khẩu?</h2>
                <p className="text-orange-100 mb-8">Nhập email để nhận mật khẩu mới</p>

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-500/20 border border-green-500/40 text-green-200 text-sm font-medium rounded-xl backdrop-blur-sm"
                  >
                    ✅ {message}
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-500/20 border border-red-500/40 text-red-200 text-sm font-medium rounded-xl backdrop-blur-sm"
                  >
                    ⚠️ {error}
                  </motion.div>
                )}

                <div className="input-field mb-6">
                  <input
                    type="email"
                    required
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 hover:border-white/40 focus:border-orange-500 text-white placeholder-gray-400 px-4 py-3 rounded-xl outline-none transition-all duration-300 focus:bg-white/10"
                    disabled={isLoading}
                  />
                  <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                    isLoading
                      ? "bg-gray-400/50 cursor-wait"
                      : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:shadow-lg hover:shadow-orange-500/50 text-white"
                  }`}
                >
                  {isLoading ? "Đang gửi..." : "Gửi mật khẩu mới"}
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                onSubmit={handleVerifyOTP}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-3xl font-black text-white mb-2">Nhập mã OTP</h2>
                <p className="text-orange-100 mb-8">Mã xác nhận đã được gửi tới <strong>{email}</strong></p>

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-500/20 border border-green-500/40 text-green-200 text-sm font-medium rounded-xl backdrop-blur-sm"
                  >
                    ✅ {message}
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-500/20 border border-red-500/40 text-red-200 text-sm font-medium rounded-xl backdrop-blur-sm"
                  >
                    ⚠️ {error}
                  </motion.div>
                )}

                <input
                  type="text"
                  required
                  maxLength="6"
                  placeholder="X X X X X X"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 hover:border-white/40 focus:border-orange-500 text-white px-4 py-3 mb-6 rounded-xl outline-none transition-all duration-300 focus:bg-white/10 font-bold text-center tracking-[0.5em] text-lg"
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                    isLoading
                      ? "bg-gray-400/50 cursor-wait"
                      : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:shadow-lg hover:shadow-orange-500/50 text-white"
                  }`}
                >
                  {isLoading ? "Đang kiểm tra..." : "Xác nhận mã OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full mt-4 text-sm font-medium text-gray-300 hover:text-orange-300 transition-colors"
                >
                  Nhập lại Email khác
                </button>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form
                onSubmit={handleResetPassword}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-3xl font-black text-white mb-2">Tạo mật khẩu mới</h2>
                <p className="text-orange-100 mb-8">Nhập mật khẩu mới cho tài khoản của bạn</p>

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-500/20 border border-green-500/40 text-green-200 text-sm font-medium rounded-xl backdrop-blur-sm"
                  >
                    ✅ {message}
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-500/20 border border-red-500/40 text-red-200 text-sm font-medium rounded-xl backdrop-blur-sm"
                  >
                    ⚠️ {error}
                  </motion.div>
                )}

                <div className="input-field mb-4">
                  <input
                    type="password"
                    required
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 hover:border-white/40 focus:border-orange-500 text-white placeholder-gray-400 px-4 py-3 rounded-xl outline-none transition-all duration-300 focus:bg-white/10"
                    disabled={isLoading}
                  />
                  <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>

                <div className="input-field mb-6">
                  <input
                    type="password"
                    required
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 hover:border-white/40 focus:border-orange-500 text-white placeholder-gray-400 px-4 py-3 rounded-xl outline-none transition-all duration-300 focus:bg-white/10"
                    disabled={isLoading}
                  />
                  <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                    isLoading
                      ? "bg-gray-400/50 cursor-wait"
                      : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:shadow-lg hover:shadow-orange-500/50 text-white"
                  }`}
                >
                  {isLoading ? "Đang xử lý..." : "Lưu mật khẩu mới"}
                </button>
              </motion.form>
            )}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/login"
              className="text-gray-300 hover:text-orange-300 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;