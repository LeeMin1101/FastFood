const express = require('express');
const router = express.Router();
const TableOrder = require('../models/TableOrder');
const Table = require('../models/tables'); // Nhúng thêm model Table

router.post('/', async (req, res) => {
  try {
    const { name, phone, date, time, guests, note, tableNumber } = req.body;
    
    // 1. Lưu đơn đặt bàn
    const newReservation = new TableOrder({ name, phone, date, time, guests, note, tableNumber });
    await newReservation.save();
    
    // 2. Chuyển bàn đó thành màu Đỏ (Đã đặt)
    await Table.findOneAndUpdate({ tableNumber }, { isBooked: true });
    
    res.status(201).json({ success: true, message: 'Đặt bàn thành công!', data: newReservation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await TableOrder.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    // 👉 Đã sửa lỗi cảnh báo Mongoose ở dòng này
    const updatedOrder = await TableOrder.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { returnDocument: 'after' } 
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật' });
  }
});

module.exports = router;