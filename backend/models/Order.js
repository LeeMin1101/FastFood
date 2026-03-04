const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // --- THÊM TRƯỜNG USER ID VÀO ĐÂY ---
    // Để biết đơn hàng này là của tài khoản nào đặt
    userId: { 
      type: String, 
      required: false // false để khách vãng lai (không đăng nhập) vẫn đặt hàng được
    },
    
    // Đồng bộ cục customer từ Frontend
    customer: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      note: { type: String, default: "" },
    },
    items: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }, // Sửa qty thành quantity
        image: { type: String },
      }
    ],
    totalAmount: { type: Number, required: true }, // Sửa totalPrice thành totalAmount
    paymentMethod: { type: String, default: "cod" },
    status: { 
      type: String, 
      // Đồng bộ trạng thái tiếng Việt với giao diện Admin
      enum: ["Chờ xác nhận", "Đang chuẩn bị", "Đang giao", "Đã giao", "Đã hủy"],
      default: "Chờ xác nhận" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);