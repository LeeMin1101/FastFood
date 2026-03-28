import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";

// 👉 1. Đưa biến bankInfo ra NGOÀI component để tránh lỗi ReferenceError
const bankInfo = {
  bankName: "Vietcombank",
  accountName: "TRUONG LE MINH",
  accountNumber: "0123456789"
};

// 👉 2. Đường dẫn ảnh QR của bạn (để trong thư mục public/img)
const qrImage = "/img/qr_real.png"; 

export default function PaymentQR() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const amount = location.state?.amount || 0;

  const [timeLeft, setTimeLeft] = useState(600);
  const [isExpired, setIsExpired] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  // Tạo nội dung tự động dựa trên mã đơn
  const transferContent = `Thanh toan don ${orderId ? orderId.substring(0, 6) : "123"}`;

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleConfirmPayment = () => {
    alert("Cảm ơn bạn! Chúng tôi sẽ kiểm tra biến động số dư và xác nhận đơn hàng ngay.");
    const savedUser = JSON.parse(localStorage.getItem("user"));
    navigate(savedUser ? "/profile" : "/");
  };

  if (!amount) return <div className="min-h-screen pt-32 text-center text-white">Đơn hàng không hợp lệ.</div>;

  return (
    <div className="min-h-screen py-20 flex items-center justify-center bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl relative">
        
        <h2 className="text-2xl font-black text-white mb-2">Thanh Toán Chuyển Khoản</h2>
        <p className="text-gray-300 text-sm mb-6">Mã đơn: <span className="text-orange-400 font-bold">{orderId}</span></p>

        {isExpired ? (
          <div className="bg-red-500/20 border border-red-500 rounded-2xl p-6 mb-6">
            <h3 className="text-red-400 font-bold text-xl mb-2">Đã Hết Thời Gian</h3>
            <p className="text-gray-300 text-sm mb-4">Vui lòng quay lại giỏ hàng và đặt lại đơn mới.</p>
            <Link to="/cart" className="inline-block bg-red-500 text-white px-6 py-2 rounded-xl font-bold">Về giỏ hàng</Link>
          </div>
        ) : (
          <>
            {/* Box Ảnh QR - FIX KHUNG ẢNH Ở ĐÂY */}
            <div className="bg-white p-4 rounded-2xl mb-6 shadow-lg flex flex-col items-center justify-center mx-auto w-fit">
              <img src={qrImage} alt="Mã QR Chuyển Khoản" className="w-full max-w-[250px] h-auto object-contain rounded-md" />
              <p className="text-xs text-gray-500 font-bold mt-3">Quét mã bằng App Ngân hàng</p>
            </div>

            {/* Box Tóm tắt tiền */}
            <div className="space-y-1 text-white mb-6">
              <p className="text-gray-300 text-sm">Tổng tiền thanh toán:</p>
              <p className="text-4xl font-black text-orange-400">{amount.toLocaleString()} đ</p>
            </div>

            {/* Box Copy Thông tin thủ công */}
            <div className="bg-gray-900/60 border border-white/10 rounded-xl p-4 mb-6 text-left space-y-3">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-sm text-gray-400">Ngân hàng</span>
                <span className="text-sm font-bold text-white">{bankInfo.bankName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-sm text-gray-400">Chủ tài khoản</span>
                <span className="text-sm font-bold text-white uppercase">{bankInfo.accountName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <div>
                  <span className="block text-sm text-gray-400">Số tài khoản</span>
                  <span className="text-lg font-bold text-white">{bankInfo.accountNumber}</span>
                </div>
                <button onClick={() => handleCopy(bankInfo.accountNumber, "stk")} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
                  {copiedField === "stk" ? "✅ Đã copy" : "Copy"}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="block text-sm text-gray-400">Nội dung chuyển khoản</span>
                  <span className="text-md font-bold text-orange-400">{transferContent}</span>
                </div>
                <button onClick={() => handleCopy(transferContent, "nd")} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
                  {copiedField === "nd" ? "✅ Đã copy" : "Copy"}
                </button>
              </div>
            </div>

            {/* Box Đếm ngược */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 mb-6">
              <p className="text-sm text-orange-200">Giao dịch sẽ hết hạn sau: <span className="text-xl font-mono font-bold text-orange-400 ml-2">{formatTime(timeLeft)}</span></p>
            </div>

            <button 
              onClick={handleConfirmPayment}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-black uppercase tracking-wider py-4 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-[0.98] transition-all"
            >
              TÔI ĐÃ CHUYỂN KHOẢN
            </button>
          </>
        )}
      </div>
    </div>
  );
}