const mongoose = require('mongoose');

const tableOrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true },
  note: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ["Chờ xác nhận", "Đã xác nhận", "Đã hủy"], 
    default: "Chờ xác nhận" 
  }
}, { timestamps: true });

module.exports = mongoose.model('TableOrder', tableOrderSchema);