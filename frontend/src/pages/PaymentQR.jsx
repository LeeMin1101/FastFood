import React, { useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";

const PaymentQR = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy tổng tiền từ trang Checkout truyền sang
  const amount = location.state?.amount || 0;

  useEffect(() => {
    window.scrollTo(0, 0);
    // Nếu vào thẳng trang này mà không có tiền thì đá về trang chủ
    if (!amount || amount === 0) {
      navigate("/");
    }
  }, [amount, navigate]);

  /* ========================================================
     CẤU HÌNH THÔNG TIN NGÂN HÀNG CỦA BẠN (Sửa lại cho đúng)
  ======================================================== */
  const MY_BANK = {
    BANK_ID: "Vietinbank", // Tên viết tắt: MB, VCB, TCB, ACB, TPB...
    ACCOUNT_NO: "102874375639 ", // Số tài khoản của bạn
    ACCOUNT_NAME: "TRUONG LE MINH", // Tên chủ tài khoản không dấu
  };

  // Lấy 6 ký tự cuối của OrderID làm mã thanh toán cho ngắn gọn
  const shortOrderId = orderId ? orderId.slice(-6).toUpperCase() : "";
  const transferContent = `Thanh toan don ${shortOrderId}`;
  
  // Link tạo mã VietQR động
  const qrUrl = `https://img.vietqr.io/image/${MY_BANK.BANK_ID}-${MY_BANK.ACCOUNT_NO}-print.png?amount=${amount}&addInfo=${transferContent}&accountName=${MY_BANK.ACCOUNT_NAME}`;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-20 font-sans text-gray-900 flex items-center justify-center">
      <div className="max-w-xl w-full mx-auto px-4 sm:px-6">
        
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_10px_40px_rgb(0,0,0,0.06)] border border-gray-100 text-center">
          
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🏦</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 tracking-tight">
            Thanh toán chuyển khoản
          </h1>
          <p className="text-gray-500 font-medium text-sm mb-8">
            Quét mã QR dưới đây bằng ứng dụng ngân hàng của bạn. Số tiền và nội dung sẽ được nhập tự động.
          </p>

          {/* Khung chứa mã QR */}
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 inline-block mb-8 relative">
            <div className="absolute inset-0 border-2 border-dashed border-gray-300 rounded-3xl m-2 pointer-events-none"></div>
            <img 
              src={qrUrl} 
              alt="VietQR Payment" 
              className="w-64 h-64 md:w-72 md:h-72 object-contain relative z-10 rounded-xl mix-blend-multiply"
            />
          </div>

          {/* Thông tin chuyển khoản thủ công */}
          <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-4 mb-8">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-sm font-semibold text-gray-500">Số tiền</span>
              <span className="text-xl font-black text-gray-900">{amount.toLocaleString()} ₫</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-sm font-semibold text-gray-500">Nội dung CK</span>
              <span className="text-sm font-bold text-gray-900 tracking-wider bg-white px-3 py-1 rounded-md border border-gray-200">
                {transferContent}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-semibold text-gray-500">Tài khoản</span>
              <div className="text-right">
                <span className="block text-sm font-bold text-gray-900">{MY_BANK.ACCOUNT_NO}</span>
                <span className="block text-xs font-medium text-gray-500">{MY_BANK.BANK_ID} - {MY_BANK.ACCOUNT_NAME}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => navigate("/profile")}
              className="w-full bg-gray-900 text-white py-4 rounded-full font-bold shadow-md hover:bg-black hover:-translate-y-0.5 transition-all duration-300"
            >
              Tôi đã thanh toán thành công
            </button>
            <Link 
              to="/"
              className="block w-full py-4 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Về trang chủ
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentQR;