import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart
} from "../redux/cartSlice";
import { Link } from "react-router-dom";

export default function Cart() {
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();

  const SERVER_URL = "https://mtk-fastfood.onrender.com";

  const getImageUrl = (img) => {
    if (!img) return "/no-image.png";
    return img.startsWith("http")
      ? img
      : `${SERVER_URL}/${img}`;
  };

  // kiểm tra login
  const savedUser = JSON.parse(localStorage.getItem("user"));
  if (!savedUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4 text-center font-sans">
        <span className="text-6xl mb-4">🔒</span>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Vui lòng đăng nhập</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Bạn cần đăng nhập vào tài khoản để xem giỏ hàng và thực hiện đặt món.
        </p>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="bg-[#FF4747] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition shadow-md"
          >
            Đăng nhập ngay
          </Link>
          <Link
            to="/"
            className="bg-white border border-gray-200 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
          Giỏ hàng của bạn
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
            <svg className="w-24 h-24 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-8">Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
            <a href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200">
              Tiếp tục mua sắm
            </a>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">

            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {cartItems.map(item => (
                    <li key={item._id} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-gray-50 transition-colors">

                      <div className="shrink-0 rounded-xl border border-gray-200 overflow-hidden w-24 h-24 sm:w-32 sm:h-32">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            e.target.src = "/no-image.png";
                          }}
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between sm:grid sm:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">Phân loại: Mặc định</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {item.price.toLocaleString('vi-VN')} đ
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                            <button
                              onClick={() => dispatch(decreaseQuantity(item._id))}
                              className="px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition rounded-l-lg"
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-medium text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => dispatch(increaseQuantity(item._id))}
                              className="px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition rounded-r-lg"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => dispatch(removeFromCart(item._id))}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
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

            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

                <div className="flow-root">
                  <dl className="-my-4 text-sm divide-y divide-gray-200">
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-gray-600">Tạm tính</dt>
                      <dd className="font-medium text-gray-900">
                        {total.toLocaleString('vi-VN')} đ
                      </dd>
                    </div>
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-gray-600">Phí giao hàng</dt>
                      <dd className="font-medium text-gray-900">Miễn phí</dd>
                    </div>
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-base font-bold text-gray-900">Tổng cộng</dt>
                      <dd className="text-2xl font-extrabold text-blue-600">
                        {total.toLocaleString('vi-VN')} đ
                      </dd>
                    </div>
                  </dl>
                </div>

                <Link
                  to="/checkout"
                  className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors mt-4"
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