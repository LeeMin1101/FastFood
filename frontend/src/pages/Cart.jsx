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

  // ✅ Hàm xử lý hình ảnh
  const getImageUrl = (img) => {
    if (!img) return "/no-image.png";
    return img.startsWith("http")
      ? img
      : `${SERVER_URL}/${img}`;
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-8">
          Giỏ hàng của bạn
        </h1>

        {cartItems.length === 0 ? (
          // --- EMPTY STATE ---
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-12 text-center flex flex-col items-center">
            <svg className="w-24 h-24 text-orange-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-semibold text-white mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-300 mb-8">Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
            <a href="/" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all shadow-lg">
              Tiếp tục mua sắm
            </a>
          </div>
        ) : (
          // --- CART CONTENT ---
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            
            {/* Cột trái */}
            <div className="lg:col-span-8">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                <ul className="divide-y divide-white/10">
                  {cartItems.map(item => (
                    <li key={item._id} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-white/5 transition-colors">
                      
                      {/* ✅ Ảnh sản phẩm */}
                      <div className="shrink-0 rounded-xl border border-white/20 overflow-hidden w-24 h-24 sm:w-32 sm:h-32 shadow-lg">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            e.target.src = "/no-image.png";
                          }}
                        />
                      </div>

                      {/* Thông tin */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between sm:grid sm:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white line-clamp-2">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-400">Phân loại: Mặc định</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-300">
                              {item.price.toLocaleString('vi-VN')} đ
                            </p>
                          </div>
                        </div>

                        {/* Nút hành động */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center border border-white/20 rounded-lg bg-white/5">
                            <button
                              onClick={() => dispatch(decreaseQuantity(item._id))}
                              className="px-3 py-1.5 text-gray-300 hover:text-orange-400 hover:bg-orange-500/20 transition"
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-medium text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => dispatch(increaseQuantity(item._id))}
                              className="px-3 py-1.5 text-gray-300 hover:text-orange-400 hover:bg-orange-500/20 transition"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => dispatch(removeFromCart(item._id))}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-lg transition"
                          >
                            Xoá
                          </button>
                        </div>
                      </div>

                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Cột phải */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sticky top-[100px]">
                <h2 className="text-xl font-bold text-white mb-6">Tóm tắt đơn hàng</h2>

                <div className="flow-root">
                  <dl className="-my-4 text-sm divide-y divide-white/10">
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-gray-300">Tạm tính</dt>
                      <dd className="font-medium text-white">
                        {total.toLocaleString('vi-VN')} đ
                      </dd>
                    </div>
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-gray-300">Phí giao hàng</dt>
                      <dd className="font-medium text-white">Miễn phí</dd>
                    </div>
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-base font-bold text-white">Tổng cộng</dt>
                      <dd className="text-2xl font-extrabold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        {total.toLocaleString('vi-VN')} đ
                      </dd>
                    </div>
                  </dl>
                </div>

                <Link
                  to="/checkout"
                  className="block text-center w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 rounded-xl transition-all mt-6 shadow-lg hover:shadow-orange-500/50"
                >
                  Tiến hành thanh toán
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}