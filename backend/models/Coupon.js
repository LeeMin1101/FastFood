// models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true }, // MÃ: SALE10, FREESHIP
  discountType: { type: String, enum: ['percent', 'fixed'], required: true }, // Loại giảm: Theo % hoặc Trừ thẳng tiền
  discountValue: { type: Number, required: true }, // Giá trị (VD: 10%, hoặc 20.000đ)
  minOrderValue: { type: Number, default: 0 }, // Đơn tối thiểu để được áp dụng (VD: Đơn > 100k)
  expiryDate: { type: Date, required: true }, // Ngày hết hạn
  isActive: { type: Boolean, default: true } // Trạng thái Bật/Tắt
});

module.exports = mongoose.model('Coupon', couponSchema);