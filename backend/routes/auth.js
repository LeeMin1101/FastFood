const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");

const { protect, isAdmin } = require("../middlewares/authMiddleware");
const { googleLogin } = require("../controllers/authController");

// Cấu hình Multer upload avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, "avatar-" + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// API Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, phone, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username hoặc Email đã tồn tại" });
    }

    const newUser = new User({ name, username, email, phone, password });
    await newUser.save();

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu!" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        username: user.username, 
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar 
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API Login bằng Google
router.post("/google", googleLogin);

// API Cập nhật Profile cá nhân (User)
router.put("/profile", protect, upload.single("avatar"), async (req, res) => {
  try {
    const { name, phone } = req.body;
    let updateData = { name, phone };
    
    if (req.file) updateData.avatar = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select("-password");
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =========================================================
// API DÀNH CHO ADMIN (Quản lý Khách hàng trên Dashboard)
// =========================================================

// Lấy danh sách tất cả Users
router.get("/users", protect, isAdmin, async (req, res) => {
  try {
    // Loại bỏ trường password khi gửi về Client để bảo mật
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy danh sách user" });
  }
});

// Cập nhật thông tin/quyền User (Admin)
router.put("/users/:id", protect, isAdmin, async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    let user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;
    if (password) user.password = password; // Chỉ cập nhật pass nếu admin có nhập

    await user.save();
    
    // Ẩn password trước khi trả data về frontend
    user.password = undefined; 
    res.json({ message: "Cập nhật thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật user" });
  }
});

// Xóa User (Admin)
router.delete("/users/:id", protect, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa user thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa user" });
  }
});

module.exports = router;