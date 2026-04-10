import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart
} from "../redux/cartSlice";
import { Link } from "react-router-dom";
import { SERVER_URL } from "../config";

export default function Cart() {
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();

  const getImageUrl = (img) => {
    if (!img) return "/no-image.png";
    return img.startsWith("http")
      ? img
      : `${SERVER_URL}${img.startsWith('/') ? img : '/' + img}`;
  };

  // Tính tổng tiền toàn bộ giỏ
  const total = cartItems.reduce((sum, item) => {
    const itemTotal = item.totalPrice || (item.price * item.quantity);
    return sum + itemTotal;
  }, 0);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FAFAFA] font-sans text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tiêu đề trang */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Giỏ hàng của bạn
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            {cartItems.length} sản phẩm trong giỏ
          </p>
        </div>

        {cartItems.length === 0 ? (
          // TRẠNG THÁI GIỎ HÀNG TRỐNG
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-16 text-center flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Chưa có sản phẩm nào</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              Giỏ hàng của bạn đang trống. Hãy quay lại thực đơn để chọn cho mình những món ăn tuyệt vời nhất.
            </p>
            <Link 
              to="/menu" 
              className="bg-gray-900 text-white px-10 py-4 rounded-full font-semibold hover:bg-black transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
            >
              Khám phá thực đơn
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-10 lg:items-start">
            
            {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
            <div className="lg:col-span-8">
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-50">
                  {cartItems.map((item) => {
                    const uniqueId = item.cartItemId || item._id;
                    const itemTotal = item.totalPrice || (item.price * item.quantity);
                    const itemUnit = item.unitPrice || item.price;

                    return (
                      <li key={uniqueId} className="p-6 md:p-8 flex flex-col sm:flex-row gap-6 hover:bg-gray-50/50 transition-colors group">
                        
                        {/* Ảnh sản phẩm */}
                        <div className="shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border border-gray-100 overflow-hidden bg-gray-50 relative">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.src = "/no-image.png"; }}
                          />
                        </div>

                        {/* Chi tiết sản phẩm */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                            
                            {/* Thông tin Text */}
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                {item.name}
                              </h3>
                              
                              <div className="mt-2 space-y-1">
                                {item.variant && (
                                  <p className="text-sm font-semibold text-orange-600">
                                    {item.variant}
                                  </p>
                                )}
                                
                                {item.selectedToppings && item.selectedToppings.length > 0 && (
                                  <p className="text-sm text-gray-500 leading-relaxed">
                                    <span className="font-medium text-gray-700">Thêm: </span> 
                                    {item.selectedToppings.map(t => t.name).join(", ")}
                                  </p>
                                )}

                                {item.notes && (
                                  <p className="text-sm text-gray-500 italic leading-relaxed">
                                    <span className="font-medium text-gray-700 not-italic">Ghi chú: </span>
                                    "{item.notes}"
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Giá tiền */}
                            <div className="text-left sm:text-right">
                              <p className="text-xl font-bold text-gray-900">
                                {itemTotal.toLocaleString('vi-VN')} ₫
                              </p>
                              <p className="text-sm text-gray-400 mt-1 font-medium">
                                {itemUnit.toLocaleString('vi-VN')} ₫ / món
                              </p>
                            </div>
                          </div>

                          {/* Bộ điều khiển Số lượng & Xóa */}
                          <div className="mt-6 flex items-end justify-between">
                            
                            {/* Input Số lượng phong cách Capsule */}
                            <div className="flex items-center border border-gray-200 rounded-full bg-white p-1 shadow-sm">
                              <button
                                onClick={() => dispatch(decreaseQuantity(uniqueId))}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                              </button>
                              <span className="w-10 text-center font-bold text-gray-900 text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => dispatch(increaseQuantity(uniqueId))}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                              </button>
                            </div>

                            {/* Nút Xóa Text-link thanh lịch */}
                            <button
                              onClick={() => dispatch(removeFromCart(uniqueId))}
                              className="text-sm font-medium text-gray-400 hover:text-red-500 underline-offset-4 hover:underline transition-all flex items-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              Xóa
                            </button>
                          </div>
                        </div>

                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* CỘT PHẢI: BILL THANH TOÁN (TÓM TẮT) */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 lg:p-8 sticky top-32">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                  Chi tiết thanh toán
                </h2>

                <div className="space-y-4 text-sm font-medium text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Tạm tính</span>
                    <span className="text-gray-900 font-semibold">{total.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Phí vận chuyển</span>
                    <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-md">Miễn phí</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-6 pt-6 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-base font-bold text-gray-900">Tổng cộng</span>
                    <div className="text-right">
                      <span className="text-3xl font-black text-gray-900 block leading-none">
                        {total.toLocaleString('vi-VN')} ₫
                      </span>
                      <span className="text-xs text-gray-400 mt-1 font-medium italic">
                        (Đã bao gồm VAT)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nút Call-to-action */}
                <Link
                  to="/checkout"
                  className="flex items-center justify-center w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-full transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
                >
                  Tiến hành thanh toán
                </Link>
                
                <Link
                  to="/menu"
                  className="block text-center text-gray-500 font-semibold mt-6 hover:text-gray-900 underline-offset-4 hover:underline transition-colors"
                >
                  Quay lại thực đơn
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}