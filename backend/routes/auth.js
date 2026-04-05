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

// API Quên mật khẩu (Gửi pass mới qua Email)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email này chưa được đăng ký trong hệ thống!" });
    }

    // Tạo mật khẩu mới ngẫu nhiên 8 ký tự
    const newPassword = Math.random().toString(36).slice(-8);
    
    user.password = newPassword;
    await user.save();

    // Cấu hình gửi mail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
      }
    });

    const mailOptions = {
      from: `"MTK FastFood" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "🍔 MTK FastFood - Cấp lại mật khẩu mới",
      html: `
        <h3>Chào ${user.name},</h3>
        <p>Bạn vừa yêu cầu cấp lại mật khẩu tại MTK FastFood.</p>
        <p>🔑 Mật khẩu mới của bạn là: <strong style="color: red; font-size: 18px;">${newPassword}</strong></p>
        <p>Vui lòng đăng nhập lại bằng mật khẩu này nhé!</p>
        <br/>
        <p>Trân trọng,<br/>Đội ngũ MTK FastFood</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Mật khẩu mới đã được gửi vào Email của bạn. Vui lòng kiểm tra hộp thư!" });

  } catch (error) {
    console.error("Lỗi gửi email:", error);
    res.status(500).json({ message: "Lỗi server khi gửi email cấp lại mật khẩu." });
  }
});

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
// API DÀNH CHO ADMIN
// =========================================================

// Lấy danh sách tất cả Users
router.get("/users", protect, isAdmin, async (req, res) => {
  try {
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
    if (password) user.password = password;

    await user.save();
    
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