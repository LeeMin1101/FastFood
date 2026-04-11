const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },
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
        quantity: { type: Number, required: true },
        image: { type: String },
        variant: { type: String, default: "" },
        notes: { type: String, default: "" }
      }
    ],
    totalAmount: { type: Number, required: true },
    couponCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: "cod" },
    status: {
      type: String,
      enum: ['Chờ thanh toán', 'Chờ xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Đã giao', 'Đã hủy'],
      default: 'Chờ xác nhận'
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);