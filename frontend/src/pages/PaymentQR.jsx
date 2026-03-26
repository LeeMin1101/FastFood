import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";

export default function PaymentQR() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const amount = location.state?.amount || 0;

  // Thời gian đếm ngược (10 phút = 600 giây)
  const [timeLeft, setTimeLeft] = useState(600);
  const [isExpired, setIsExpired] = useState(false);

  // Link VietQR (Tự động điền số tiền và nội dung)
  const qrUrl = `https://img.vietqr.io/image/vietinbank-113366668888-compact.jpg?amount=${amount}&addInfo=Thanh toan don ${orderId.substring(0, 6)}`;

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format giây thành phút:giây
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleConfirmPayment = () => {
    // Trong thực tế, bạn sẽ gọi API để đổi status từ "Chờ thanh toán" sang "Chờ xác nhận"
    // Ở đây mình alert và điều hướng cho mượt
    alert("Cảm ơn bạn! Chúng tôi đang kiểm tra giao dịch và sẽ xác nhận đơn hàng sớm nhất.");
    const savedUser = JSON.parse(localStorage.getItem("user"));
    navigate(savedUser ? "/profile" : "/");
  };

  if (!amount) return <div className="min-h-screen pt-32 text-center text-white">Đơn hàng không hợp lệ.</div>;

  return (
    <div className="min-h-screen py-20 flex items-center justify-center bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl relative">
        
        <h2 className="text-2xl font-black text-white mb-2">Thanh Toán Chuyển Khoản</h2>
        <p className="text-gray-300 text-sm mb-6">Mã đơn hàng: <span className="text-orange-400 font-bold">{orderId}</span></p>

        {isExpired ? (
          <div className="bg-red-500/20 border border-red-500 rounded-2xl p-6 mb-6">
            <h3 className="text-red-400 font-bold text-xl mb-2">Mã QR Đã Hết Hạn</h3>
            <p className="text-gray-300 text-sm mb-4">Vui lòng đặt lại đơn hàng mới.</p>
            <Link to="/" className="inline-block bg-red-500 text-white px-6 py-2 rounded-xl font-bold">Về trang chủ</Link>
          </div>
        ) : (
          <>
            <div className="bg-white p-4 rounded-2xl mb-6 shadow-lg inline-block">
              <img src={qrUrl} alt="QR Code" className="w-56 h-56 object-contain" />
            </div>

            <div className="space-y-2 text-white mb-8">
              <p className="text-gray-300">Tổng tiền cần thanh toán:</p>
              <p className="text-3xl font-black text-orange-400">{amount.toLocaleString()} đ</p>
            </div>

            <div className="bg-gray-900/50 border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400 mb-1">Thời gian chờ thanh toán còn lại:</p>
              <p className="text-2xl font-mono font-bold text-red-400">{formatTime(timeLeft)}</p>
            </div>

            <button 
              onClick={handleConfirmPayment}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-95 transition-all"
            >
              TÔI ĐÃ CHUYỂN KHOẢN THÀNH CÔNG
            </button>
          </>
        )}
      </div>
    </div>
  );
}