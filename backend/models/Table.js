const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  isBooked: { type: Boolean, default: false } // false: Xanh (Trống), true: Đỏ (Đã đặt)
});

module.exports = mongoose.model('Table', tableSchema);