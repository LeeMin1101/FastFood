const express = require("express");
const router = express.Router();
const Banner = require("../models/Banner");
const multer = require("multer");
const path = require("path");
const { protect, isAdmin } = require("../middlewares/authMiddleware");

// Cấu hình lưu ảnh Banner
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, "banner-" + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// [GET] Lấy TẤT CẢ Banner (Dành cho Admin)
router.get("/", isAdmin, async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// [GET] Lấy Banner ĐANG HOẠT ĐỘNG (Dành cho Trang chủ)
router.get("/active", async (req, res) => {
  try {
    const currentDate = new Date();
    // Điều kiện: Bật isActive = true VÀ thời gian hiện tại nằm giữa startDate và endDate
    const banners = await Banner.find({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    }).sort({ createdAt: -1 });
    
    res.json(banners);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// [POST] Thêm Banner mới
router.post("/", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, startDate, endDate, isActive } = req.body;
    if (!req.file) return res.status(400).json({ message: "Vui lòng tải ảnh lên" });

    const newBanner = new Banner({
      title, startDate, endDate, isActive,
      image: `/uploads/${req.file.filename}`
    });
    await newBanner.save();
    res.status(201).json(newBanner);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// [PUT] Sửa Banner
router.put("/:id", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, startDate, endDate, isActive } = req.body;
    let updateData = { title, startDate, endDate, isActive };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedBanner);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// [DELETE] Xóa Banner
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa banner" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;