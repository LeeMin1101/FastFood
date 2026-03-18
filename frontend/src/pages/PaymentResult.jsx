import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { SERVER_URL } from "../config";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const checkPayment = async () => {
      // MoMo trả về tham số resultCode (0 là thành công)
      const resultCode = searchParams.get("resultCode");
      const orderId = searchParams.get("orderId");

      if (resultCode === "0") {
        setStatus("success");
        // Tại đây bạn có thể gọi API cập nhật trạng thái đơn hàng thành "Đã thanh toán"
        // await axios.put(`${SERVER_URL}/api/orders/${orderId}/status`, { status: "Đã thanh toán" });
      } else {
        setStatus("failed");
      }
    };
    
    checkPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl text-center max-w-md w-full">
        {status === "loading" && (
          <div>
            <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-white">Đang xử lý kết quả...</h2>
          </div>
        )}
        
        {status === "success" && (
          <>
            <div className="text-green-400 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-300 mb-8">Cảm ơn bạn đã mua hàng tại MTK FastFood.</p>
            <Link to="/" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all inline-block shadow-lg">
              Quay về trang chủ
            </Link>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="text-red-400 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-300 mb-8">Bạn đã hủy giao dịch hoặc có lỗi xảy ra.</p>
            <Link to="/cart" className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all inline-block shadow-lg">
              Quay lại Giỏ hàng
            </Link>
          </>
        )}
      </div>
    </div>
  );
}