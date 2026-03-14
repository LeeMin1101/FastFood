import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { clearCart } from "../redux/cartSlice"; 
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); 
  const cartItems = useSelector((state) => state.cart.items);
  
  const subTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingFee = subTotal > 0 ? 15000 : 0;
  const totalAmount = subTotal + shippingFee;

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isLocating, setIsLocating] = useState(false);
  const [savedUser, setSavedUser] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: ""
  });

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr && userStr !== "undefined") {
        const user = JSON.parse(userStr);
        setSavedUser(user);
        setFormData(prev => ({
          ...prev,
          fullName: user.name || "",
          phone: user.phone || "",
        }));
      }
    } catch (e) {
      console.log("Lỗi parse thông tin user");
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAutoLocate = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
            
            const address = res.data.address;
            const houseNumber = address.house_number || "";
            const road = address.road || address.pedestrian || "";
            const ward = address.suburb || address.village || address.quarter || address.hamlet || "";
            const district = address.county || address.city_district || address.district || "";
            const city = address.city || address.province || address.state || "";

            const streetInfo = [houseNumber, road].filter(Boolean).join(" ");
            const exactLocation = [streetInfo, ward, district, city].filter(item => item !== "" && item !== undefined).join(", ");

            setFormData(prev => ({ ...prev, address: exactLocation }));
          } catch (error) {
            alert("Không thể dịch được địa chỉ, vui lòng nhập tay.");
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          alert("Bạn chưa cấp quyền vị trí cho trình duyệt!");
          setIsLocating(false);
        }
      );
    } else {
      alert("Trình duyệt của bạn không hỗ trợ định vị.");
      setIsLocating(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!savedUser) return alert("Bạn cần đăng nhập để đặt hàng!"); 
    if (cartItems.length === 0) return alert("Giỏ hàng của bạn đang trống!");
    
    const orderData = {
      userId: savedUser.id, 
      customer: formData,
      items: cartItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      status: "Chờ xác nhận"
    };

    try {
      const resOrder = await axios.post("https://mtk-fastfood.onrender.com/api/orders", orderData);
      const newOrderId = resOrder.data._id; 
      
      dispatch(clearCart());

      if (paymentMethod === "cod") {
        alert("🎉 Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.");
        navigate("/profile"); 
      } 
      else if (paymentMethod === "online") {
        const resMomo = await axios.post("https://mtk-fastfood.onrender.com/api/payment/momo", {
          amount: totalAmount,
          orderId: newOrderId.toString(), 
          orderInfo: `Thanh toan don hang ${newOrderId}`
        });

        if (resMomo.data && resMomo.data.payUrl) {
          window.location.href = resMomo.data.payUrl;
        } else {
          alert("Không thể tạo link thanh toán MoMo. Vui lòng thử lại!");
        }
      }
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng, vui lòng thử lại!"));
    }
  };

  if (!savedUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <span className="text-6xl mb-4">🔒</span>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Bạn cần đăng nhập để thanh toán</h2>
        <p className="text-gray-500 mb-8 max-w-md">Vui lòng đăng nhập vào tài khoản của bạn để hệ thống có thể lưu trữ và theo dõi đơn hàng chính xác nhất.</p>
        <div className="flex gap-4">
          <Link to="/login" className="bg-[#FF4747] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition shadow-md">Đăng nhập ngay</Link>
          <Link to="/" className="bg-white border border-gray-200 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition">Quay lại</Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <span className="text-6xl mb-4">🛒</span>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Giỏ hàng của bạn đang trống</h2>
        <Link to="/" className="bg-[#FF4747] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition shadow-md">Quay lại mua sắm</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-black text-slate-800 mb-8">Thanh Toán Đơn Hàng</h1>
        
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><span className="text-2xl">🛵</span> Thông tin giao hàng</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Họ và tên *</label>
                  <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Nhập họ tên người nhận" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-100 focus:border-[#FF4747] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại *</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Nhập số điện thoại" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-100 focus:border-[#FF4747] transition-all" />
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex justify-between items-end mb-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Địa chỉ nhận hàng *</label>
                    <button type="button" onClick={handleAutoLocate} disabled={isLocating} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      {isLocating ? "⏳ Đang định vị..." : "📍 Lấy vị trí hiện tại"}
                    </button>
                  </div>
                  <input required type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="VD: 123 Nguyễn Văn Tiên, Khu phố 9, Biên Hòa..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-100 focus:border-[#FF4747] transition-all" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ghi chú cho Shipper (Tùy chọn)</label>
                  <textarea name="note" value={formData.note} onChange={handleInputChange} placeholder="VD: Giao tới gọi điện xuống lấy, không bấm chuông..." rows="2" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-100 focus:border-[#FF4747] transition-all"></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><span className="text-2xl">💳</span> Phương thức thanh toán</h2>
              
              <div className="space-y-4">
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "cod" ? "border-[#FF4747] bg-[#FFF0F0]" : "border-gray-200 hover:border-red-200"}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="w-5 h-5 accent-[#FF4747] text-[#FF4747]" />
                  <div className="ml-4 flex items-center gap-3">
                    <span className="text-3xl">💵</span>
                    <div>
                      <p className="font-bold text-slate-800">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi Shipper giao tới.</p>
                    </div>
                  </div>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "online" ? "border-[#FF4747] bg-[#FFF0F0]" : "border-gray-200 hover:border-red-200"}`}>
                  <input type="radio" name="payment" value="online" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="w-5 h-5 accent-[#FF4747] text-[#FF4747]" />
                  <div className="ml-4 flex items-center gap-3">
                    <img src="https://img.mservice.com.vn/app/img/payment/momo-icon.png" alt="MoMo" className="w-8 h-8 object-contain rounded-md" />
                    <div>
                      <p className="font-bold text-slate-800">Thanh toán qua Ví MoMo</p>
                      <p className="text-sm text-gray-500">Quét mã QR an toàn, tiện lợi.</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div className="flex gap-3">
                      <div className="font-bold text-slate-800">{item.quantity}x</div>
                      <div>
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        {item.option && <p className="text-xs text-gray-500">{item.option}</p>}
                      </div>
                    </div>
                    <div className="font-semibold text-slate-800 whitespace-nowrap ml-4">{(item.price * item.quantity).toLocaleString()} đ</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm border-t pt-4 mb-6">
                <div className="flex justify-between text-gray-600"><span>Tạm tính ({cartItems.length} món)</span><span>{subTotal.toLocaleString()} đ</span></div>
                <div className="flex justify-between text-gray-600"><span>Phí giao hàng</span><span>{shippingFee.toLocaleString()} đ</span></div>
              </div>

              <div className="flex justify-between items-center border-t pt-4 mb-8">
                <span className="text-lg font-bold text-slate-800">Tổng cộng</span>
                <span className="text-2xl font-black text-[#FF4747]">{totalAmount.toLocaleString()} đ</span>
              </div>

              <button type="submit" className="w-full bg-[#FF4747] text-white py-4 rounded-xl font-black text-lg shadow-md hover:shadow-lg hover:bg-red-600 transition-all transform hover:-translate-y-0.5">
                {paymentMethod === "online" ? "THANH TOÁN QUA MOMO" : "ĐẶT HÀNG NGAY"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Checkout;