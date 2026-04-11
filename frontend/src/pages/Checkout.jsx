import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { clearCart } from "../redux/cartSlice"; 
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { SERVER_URL } from "../config";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); 
  const location = useLocation();
  
  const directItem = location.state?.directItem;
  const reduxCartItems = useSelector((state) => state.cart.items);
  const cartItems = directItem ? [directItem] : reduxCartItems;
  
  const subTotal = cartItems.reduce((total, item) => {
    const itemTotal = item.totalPrice || (item.price * item.quantity);
    return total + itemTotal;
  }, 0);

  const shippingFee = subTotal > 0 ? 15000 : 0;

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); 
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  const totalAmount = Math.max(0, subTotal + shippingFee - discountAmount);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [formData, setFormData] = useState({ fullName: "", phone: "", note: "" });

  const [locations, setLocations] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [addressData, setAddressData] = useState({
    city: "",
    district: "",
    ward: "",
    street: ""
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);

    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setFormData(prev => ({ ...prev, fullName: savedUser.name || "", phone: savedUser.phone || "" }));
    }

    axios.get("https://provinces.open-api.vn/api/?depth=3")
      .then(res => setLocations(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleStreetChange = (e) => setAddressData({ ...addressData, street: e.target.value });

  const handleCityChange = (e) => {
    const cityCode = e.target.value;
    setSelectedCity(cityCode);
    setSelectedDistrict("");
    setSelectedWard("");
    
    const city = locations.find(c => String(c.code) === String(cityCode));
    setDistricts(city?.districts || []);
    setWards([]);
    setAddressData({ ...addressData, city: city?.name || "", district: "", ward: "" });
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);
    setSelectedWard("");
    
    const district = districts.find(d => String(d.code) === String(districtCode));
    setWards(district?.wards || []);
    setAddressData({ ...addressData, district: district?.name || "", ward: "" });
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    setSelectedWard(wardCode);
    
    const ward = wards.find(w => String(w.code) === String(wardCode));
    setAddressData({ ...addressData, ward: ward?.name || "" });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponMessage("Đang kiểm tra...");
    
    try {
      const res = await axios.post(`${SERVER_URL}/api/coupons/apply`, {
        code: couponCode,
        orderValue: subTotal,
        shippingFee: shippingFee
      });
      
      setDiscountAmount(res.data.discountAmount);
      setAppliedCoupon(res.data.code);
      setCouponMessage("🎉 " + res.data.message);
    } catch (error) {
      setDiscountAmount(0);
      setAppliedCoupon(null);
      setCouponMessage("❌ " + (error.response?.data?.message || "Lỗi kiểm tra mã"));
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert("Giỏ hàng của bạn đang trống!");
    if (!addressData.city || !addressData.district || !addressData.ward || !addressData.street) {
      return alert("Vui lòng điền đầy đủ và chính xác Tỉnh/Thành, Quận/Huyện, Phường/Xã và Số nhà!");
    }
    
    const savedUser = JSON.parse(localStorage.getItem("user"));
    const fullAddress = `${addressData.street}, ${addressData.ward}, ${addressData.district}, ${addressData.city}`;
    
    const orderData = {
      userId: savedUser ? savedUser.id : null,
      customer: { ...formData, address: fullAddress },
      items: cartItems.map(item => ({ 
        name: item.name, 
        price: item.unitPrice || item.price, 
        quantity: item.quantity, 
        image: item.image,
        variant: item.variant || "",
        notes: item.notes || ""
      })),
      totalAmount: totalAmount,
      couponCode: appliedCoupon,
      discountAmount: discountAmount,
      paymentMethod: paymentMethod,
      status: paymentMethod === "banking" ? "Chờ thanh toán" : "Chờ xác nhận"
    };

    try {
      const res = await axios.post(`${SERVER_URL}/api/orders`, orderData);
      const newOrderId = res.data._id;

      if (!directItem) dispatch(clearCart());

      if (paymentMethod === "banking") {
        navigate(`/payment-qr/${newOrderId}`, { state: { amount: totalAmount } });
      } else {
        alert("Thanh toán thành công! Đơn hàng của bạn đang được xử lý.");
        navigate(savedUser ? "/profile" : "/");
      }
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!"));
    }
  };

  if (cartItems.length === 0) return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Giỏ hàng của bạn đang trống</h2>
      <Link to="/menu" className="bg-gray-900 hover:bg-black text-white px-10 py-4 rounded-full font-semibold transition-all shadow-md hover:-translate-y-0.5">Quay lại thực đơn</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-20 font-sans text-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center justify-center mb-10"
        >
          <span className="text-gray-500 font-bold tracking-[0.3em] text-xs md:text-sm uppercase mb-3">
            Hoàn tất đơn hàng
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight relative pb-5 inline-block">
            Thanh Toán
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gray-900 rounded-full"></div>
          </h1>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          onSubmit={handlePlaceOrder} 
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
        >
          
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center text-sm">1</span>
                Thông tin người nhận
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Họ và tên</label>
                  <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Số điện thoại</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all" />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tỉnh / Thành phố</label>
                    <select required value={selectedCity} onChange={handleCityChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all cursor-pointer">
                      <option value="">Chọn Tỉnh/Thành</option>
                      {locations.map(city => <option key={city.code} value={city.code}>{city.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quận / Huyện</label>
                    <select required value={selectedDistrict} onChange={handleDistrictChange} disabled={districts.length === 0} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map(dist => <option key={dist.code} value={dist.code}>{dist.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phường / Xã</label>
                    <select required value={selectedWard} onChange={handleWardChange} disabled={wards.length === 0} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map(ward => <option key={ward.code} value={ward.code}>{ward.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Số nhà, Tên đường</label>
                  <input required type="text" value={addressData.street} onChange={handleStreetChange} placeholder="Ví dụ: 123 Lê Lợi..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ghi chú (Tùy chọn)</label>
                  <textarea name="note" value={formData.note} onChange={handleInputChange} rows="2" placeholder="Giao giờ hành chính, gọi trước khi giao..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all resize-none"></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center text-sm">2</span>
                Phương thức thanh toán
              </h2>
              
              <div className="space-y-4">
                <label className={`flex items-center p-5 border rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === "cod" ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="w-5 h-5 accent-gray-900" />
                  <div className="ml-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-lg shadow-sm">💵</div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-xs text-gray-500 mt-1">Giao hàng tận nơi, thanh toán trực tiếp.</p>
                    </div>
                  </div>
                </label>

                <label className={`flex items-center p-5 border rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === "banking" ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                  <input type="radio" name="payment" value="banking" checked={paymentMethod === "banking"} onChange={() => setPaymentMethod("banking")} className="w-5 h-5 accent-gray-900" />
                  <div className="ml-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-lg shadow-sm">🏦</div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Chuyển khoản (VietQR)</p>
                      <p className="text-xs text-gray-500 mt-1">Thanh toán an toàn, quét mã QR tiện lợi.</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-32">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item, idx) => {
                  const itemTotal = item.totalPrice || (item.price * item.quantity);
                  
                  return (
                    <div key={idx} className="flex justify-between items-start text-sm">
                      <div className="flex gap-3">
                        <div className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs mt-0.5">{item.quantity}</div>
                        <div className="font-semibold text-gray-800 leading-tight">
                          {item.name}
                          {item.variant && <div className="text-xs text-gray-500 mt-0.5">{item.variant}</div>}
                        </div>
                      </div>
                      <div className="font-bold text-gray-900 whitespace-nowrap ml-4">
                        {itemTotal.toLocaleString("vi-VN")} ₫
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-5 mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mã giảm giá</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponCode} 
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={appliedCoupon !== null}
                    placeholder="Nhập mã..." 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all font-bold uppercase disabled:opacity-60 disabled:bg-gray-200" 
                  />
                  {appliedCoupon ? (
                    <button type="button" onClick={() => { setAppliedCoupon(null); setDiscountAmount(0); setCouponCode(""); setCouponMessage(""); }} className="bg-red-50 text-red-500 px-4 rounded-xl font-bold hover:bg-red-100 transition-colors whitespace-nowrap">
                      Hủy
                    </button>
                  ) : (
                    <button type="button" onClick={handleApplyCoupon} className="bg-gray-900 text-white px-5 rounded-xl font-bold hover:bg-black transition-colors whitespace-nowrap">
                      Áp dụng
                    </button>
                  )}
                </div>
                {couponMessage && (
                  <p className={`text-xs font-bold mt-2 ${appliedCoupon ? "text-green-600" : "text-red-500"}`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-5 mb-6 space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-500">
                  <span>Tạm tính</span>
                  <span className="font-medium text-gray-900">{subTotal.toLocaleString("vi-VN")} ₫</span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>Phí giao hàng</span>
                  <span className="font-medium text-gray-900">{shippingFee.toLocaleString("vi-VN")} ₫</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="font-bold">Giảm giá ({appliedCoupon})</span>
                    <span className="font-black">- {discountAmount.toLocaleString("vi-VN")} ₫</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end border-t border-gray-100 pt-6 mb-8">
                <span className="text-base font-bold text-gray-900">Tổng cộng</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-gray-900 leading-none">{totalAmount.toLocaleString("vi-VN")} ₫</span>
                  <span className="block text-xs text-gray-400 mt-1 font-medium italic">(Đã bao gồm VAT)</span>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-gray-900 text-white py-4 rounded-full font-bold shadow-md hover:bg-black hover:-translate-y-0.5 transition-all duration-300"
              >
                {paymentMethod === "banking" ? "Thanh toán qua QR" : "Xác nhận đặt hàng"}
              </button>
            </div>
          </div>
        </motion.form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
      `}} />
    </div>
  );
};

export default Checkout;