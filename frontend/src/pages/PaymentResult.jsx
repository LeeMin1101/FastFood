import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

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
        // await axios.put(`https://mtk-fastfood.onrender.com/api/orders/${orderId}/status`, { status: "Đã thanh toán" });
      } else {
        setStatus("failed");
      }
    };
    
    checkPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
        {status === "loading" && <h2 className="text-xl font-bold">Đang xử lý kết quả...</h2>}
        
        {status === "success" && (
          <>
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-500 mb-6">Cảm ơn bạn đã mua hàng tại MTK FastFood.</p>
            <Link to="/" className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-600">Quay về trang chủ</Link>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-500 mb-6">Bạn đã hủy giao dịch hoặc có lỗi xảy ra.</p>
            <Link to="/cart" className="bg-gray-800 text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-900">Quay lại Giỏ hàng</Link>
          </>
        )}
      </div>
    </div>
  );
}