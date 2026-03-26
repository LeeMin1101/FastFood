import React from "react";

const QRImage = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-lg mt-4">
      <h3 className="text-gray-800 font-bold mb-2">Quét mã QR để thanh toán</h3>
      <img
        src="https://img.vietqr.io/image/vietinbank-113366668888-compact.jpg"
        alt="QR VietQR"
        className="w-48 sm:w-56 h-auto border border-gray-200 rounded-xl"
      />
      <p className="text-gray-500 text-sm mt-3 text-center">
        Vui lòng chụp lại màn hình giao dịch sau khi chuyển khoản thành công.
      </p>
    </div>
  );
};

export default QRImage;