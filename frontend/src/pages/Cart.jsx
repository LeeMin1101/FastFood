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

  // Tính tổng tiền toàn bộ giỏ (Có fallback cho dữ liệu cũ)
  const total = cartItems.reduce((sum, item) => {
    const itemTotal = item.totalPrice || (item.price * item.quantity);
    return sum + itemTotal;
  }, 0);

  return (
    <div className="min-h-screen py-24 bg-gradient-to-br from-gray-900 via-orange-900 to-red-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black text-white tracking-tight mb-8">
          Giỏ hàng của bạn
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-12 text-center flex flex-col items-center">
            <span className="text-8xl mb-6 opacity-30">🛒</span>
            <h2 className="text-2xl font-bold text-white mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-300 mb-8 font-medium">Bụng đói rồi, chọn món ngon cho vào giỏ ngay thôi!</p>
            <Link to="/" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all shadow-lg hover:-translate-y-1">
              Khám phá thực đơn
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            
            {/* Cột trái (Danh sách món) */}
            <div className="lg:col-span-8">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                <ul className="divide-y divide-white/10">
                  {cartItems.map((item) => {
                    const uniqueId = item.cartItemId || item._id;
                    const itemTotal = item.totalPrice || (item.price * item.quantity);
                    const itemUnit = item.unitPrice || item.price;

                    return (
                      <li key={uniqueId} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-white/5 transition-colors">
                        
                        <div className="shrink-0 rounded-2xl border border-white/20 overflow-hidden w-24 h-24 sm:w-32 sm:h-32 shadow-lg bg-white/5">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="w-full h-full object-cover object-center"
                            onError={(e) => { e.target.src = "/no-image.png"; }}
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                            <div>
                              <h3 className="text-xl font-bold text-white">
                                {item.name}
                              </h3>
                              
                              {item.variant && (
                                <p className="mt-1 text-sm font-bold text-orange-300">Phân loại: {item.variant}</p>
                              )}
                              
                              {item.selectedToppings && item.selectedToppings.length > 0 && (
                                <p className="mt-1 text-sm text-gray-300">
                                  <span className="font-semibold text-gray-400">Thêm: </span> 
                                  {item.selectedToppings.map(t => t.name).join(", ")}
                                </p>
                              )}

                              {item.notes && (
                                <p className="mt-1 text-sm text-gray-300 italic">
                                  <span className="font-semibold text-gray-400 not-italic">Ghi chú: </span>
                                  "{item.notes}"
                                </p>
                              )}
                            </div>

                            <div className="text-left sm:text-right mt-2 sm:mt-0">
                              <p className="text-lg font-black text-white">
                                {itemTotal.toLocaleString('vi-VN')} đ
                              </p>
                              <p className="text-xs text-gray-400 mt-1">{itemUnit.toLocaleString('vi-VN')} đ/món</p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center border border-white/20 rounded-xl bg-white/5 overflow-hidden">
                              <button
                                onClick={() => dispatch(decreaseQuantity(uniqueId))}
                                className="px-4 py-2 text-xl font-black text-gray-300 hover:text-white hover:bg-white/10 transition"
                              >
                                −
                              </button>
                              <span className="w-12 text-center font-bold text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => dispatch(increaseQuantity(uniqueId))}
                                className="px-4 py-2 text-xl font-black text-gray-300 hover:text-white hover:bg-white/10 transition"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => dispatch(removeFromCart(uniqueId))}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 px-4 py-2 rounded-xl transition font-bold text-sm border border-transparent hover:border-red-500/30"
                            >
                              Xóa món
                            </button>
                          </div>
                        </div>

                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Cột phải (Tổng tiền) */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 lg:p-8 sticky top-32">
                <h2 className="text-xl font-black text-white mb-6 border-b border-white/10 pb-4">Tóm tắt đơn hàng</h2>

                <div className="flow-root">
                  <dl className="-my-4 text-sm divide-y divide-white/10">
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-gray-300 font-medium">Tạm tính</dt>
                      <dd className="font-bold text-white">
                        {total.toLocaleString('vi-VN')} đ
                      </dd>
                    </div>
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-gray-300 font-medium">Phí giao hàng</dt>
                      <dd className="font-bold text-green-400">Miễn phí</dd>
                    </div>
                    <div className="py-6 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <dt className="text-lg font-bold text-white">Tổng thanh toán</dt>
                        <dd className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                          {total.toLocaleString('vi-VN')} đ
                        </dd>
                      </div>
                      <p className="text-right text-xs text-gray-400 italic">(Đã bao gồm VAT nếu có)</p>
                    </div>
                  </dl>
                </div>

                <Link
                  to="/checkout"
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black py-4 rounded-xl transition-all mt-4 shadow-lg hover:shadow-orange-500/40"
                >
                  💳 Tiến hành thanh toán
                </Link>
                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl transition-all mt-3"
                >
                  Chọn thêm món khác
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}