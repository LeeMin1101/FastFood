const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { protect } = require("../middlewares/authMiddleware"); // Đã thêm import protect

/**
 * 📌 USER: Đặt hàng
 * POST /api/orders
 */
router.post("/", async (req, res) => {
  try {
    const order = new Order(req.body);
    const savedOrder = await order.save();
    // Trả về cả savedOrder để frontend lấy được ID nếu cần
    res.status(201).json({ message: "Đặt hàng thành công ✅", order: savedOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 USER: Xem lịch sử đơn hàng của chính mình (MỚI THÊM)
 * GET /api/orders/my-orders
 */
router.get("/my-orders", protect, async (req, res) => {
  try {
    // Tìm tất cả đơn hàng có userId khớp với id của người dùng đang đăng nhập
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 ADMIN: Xem danh sách đơn hàng
 * GET /api/orders
 */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 ADMIN: Cập nhật trạng thái đơn hàng
 * PUT /api/orders/:id/status
 */
router.put("/:id/status", async (req, res) => {
  try {
    // Tìm đơn hàng theo ID và cập nhật trường status
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true } // Trả về data mới sau khi đã cập nhật
    );
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/**
 * 📌 ADMIN: Xóa đơn hàng
 * DELETE /api/orders/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa đơn hàng thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;