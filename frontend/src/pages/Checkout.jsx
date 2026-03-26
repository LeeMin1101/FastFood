import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { clearCart } from "../redux/cartSlice"; 
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { SERVER_URL } from "../config";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); 
  const location = useLocation();
  
  // Hứng dữ liệu nếu khách bấm "Mua Ngay" từ trang chi tiết
  const directItem = location.state?.directItem;
  const reduxCartItems = useSelector((state) => state.cart.items);
  const cartItems = directItem ? [directItem] : reduxCartItems;
  
  const subTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingFee = subTotal > 0 ? 15000 : 0;
  const totalAmount = subTotal + shippingFee;

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isLocating, setIsLocating] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", phone: "", address: "", note: "" });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setFormData(prev => ({ ...prev, fullName: savedUser.name || "", phone: savedUser.phone || "" }));
    }
  }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAutoLocate = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
            const address = res.data.address;
            const exactLocation = [address.house_number, address.road || address.pedestrian, address.suburb || address.village, address.county || address.city_district, address.city || address.province].filter(Boolean).join(", ");
            setFormData(prev => ({ ...prev, address: exactLocation }));
          } catch (error) {
            alert("Không thể dịch được địa chỉ, vui lòng nhập tay.");
          } finally { setIsLocating(false); }
        },
        () => { alert("Bạn chưa cấp quyền vị trí!"); setIsLocating(false); }
      );
    } else { alert("Trình duyệt không hỗ trợ định vị."); setIsLocating(false); }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert("Giỏ hàng của bạn đang trống!");
    
    const savedUser = JSON.parse(localStorage.getItem("user"));
    
    const orderData = {
      userId: savedUser ? savedUser.id : null,
      customer: formData,
      items: cartItems.map(item => ({ name: item.name, price: item.price, quantity: item.quantity, image: item.image })),
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      // ĐỔI TRẠNG THÁI: Nếu chọn QR thì trạng thái là Chờ thanh toán
      status: paymentMethod === "banking" ? "Chờ thanh toán" : "Chờ xác nhận"
    };

    try {
      const res = await axios.post(`${SERVER_URL}/api/orders`, orderData);
      const newOrderId = res.data._id; // Lấy ID đơn hàng vừa tạo

      // Chỉ xóa giỏ hàng nếu khách mua từ Giỏ (không phải bấm Mua Ngay)
      if (!directItem) dispatch(clearCart());

      if (paymentMethod === "banking") {
        // BAY SANG TRANG QR VÀ MANG THEO ID ĐƠN HÀNG + TỔNG TIỀN
        navigate(`/payment-qr/${newOrderId}`, { state: { amount: totalAmount } });
      } else {
        alert("🎉 Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.");
        navigate(savedUser ? "/profile" : "/");
      }
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!"));
    }
  };

  if (cartItems.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-white mb-4">Giỏ hàng của bạn đang trống</h2>
      <Link to="/" className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold">Quay lại mua sắm</Link>
    </div>
  );

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-black text-white mb-8">Thanh Toán Đơn Hàng</h1>
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">🛵 Thông tin giao hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">Họ và tên *</label>
                  <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">Số điện thoại *</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500" />
                </div>
                <div className="md:col-span-2">
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-semibold text-gray-200">Địa chỉ *</label>
                    <button type="button" onClick={handleAutoLocate} disabled={isLocating} className="text-xs text-orange-400">{isLocating ? "⏳ Đang định vị..." : "📍 Lấy vị trí"}</button>
                  </div>
                  <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-200 mb-2">Ghi chú (Tùy chọn)</label>
                  <textarea name="note" value={formData.note} onChange={handleInputChange} rows="2" className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500"></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">💳 Phương thức thanh toán</h2>
              <div className="space-y-4">
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "cod" ? "border-orange-500 bg-orange-500/20" : "border-white/20"}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="w-5 h-5 text-orange-500" />
                  <div className="ml-4 flex items-center gap-3">
                    <span className="text-3xl">💵</span>
                    <div>
                      <p className="font-bold text-white">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-gray-400">Thanh toán bằng tiền mặt khi Shipper giao tới.</p>
                    </div>
                  </div>
                </label>
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "banking" ? "border-orange-500 bg-orange-500/20" : "border-white/20"}`}>
                  <input type="radio" name="payment" value="banking" checked={paymentMethod === "banking"} onChange={() => setPaymentMethod("banking")} className="w-5 h-5 text-orange-500" />
                  <div className="ml-4 flex items-center gap-3">
                    <span className="text-3xl">🏦</span>
                    <div>
                      <p className="font-bold text-white">Chuyển khoản (VietQR)</p>
                      <p className="text-sm text-gray-400">Quét mã QR để thanh toán nhanh chóng.</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/20 sticky top-[100px]">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div className="flex gap-3">
                      <div className="font-bold text-orange-300">{item.quantity}x</div>
                      <div className="font-semibold text-white">{item.name}</div>
                    </div>
                    <div className="font-semibold text-orange-300">{(item.price * item.quantity).toLocaleString()} đ</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-4 mb-8">
                <span className="text-lg font-bold text-white">Tổng cộng</span>
                <span className="text-2xl font-black text-orange-400">{totalAmount.toLocaleString()} đ</span>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-black text-lg shadow-lg hover:from-orange-600 hover:scale-95 transition-all">
                {paymentMethod === "banking" ? "TẠO MÃ QR THANH TOÁN" : "XÁC NHẬN ĐẶT HÀNG"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Checkout;