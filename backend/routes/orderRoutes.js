const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// [POST] KHÁCH HÀNG ĐẶT ĐƠN (Không cần đăng nhập vẫn đặt được)
router.post("/", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lưu đơn hàng", error });
  }
});

// [GET] ADMIN LẤY DANH SÁCH ĐƠN HÀNG (Sắp xếp mới nhất lên đầu)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy đơn hàng", error });
  }
});

// [PUT] ADMIN CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
router.put("/:id/status", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật trạng thái", error });
  }
});

module.exports = router;