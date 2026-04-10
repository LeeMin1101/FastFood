const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const { protect, isAdmin } = require("../middlewares/authMiddleware");
const { googleLogin } = require("../controllers/authController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, "avatar-" + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

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

router.post("/google", googleLogin);

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email này chưa được đăng ký trong hệ thống!" });
    }

    const newPassword = Math.random().toString(36).slice(-8);
    user.password = newPassword;
    await user.save();

    res.status(200).json({ 
      message: "Reset mật khẩu thành công!", 
      newPassword: newPassword 
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi cấp lại mật khẩu." });
  }
});

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

router.put("/update-location", protect, async (req, res) => {
  try {
    const { location } = req.body;
    if (!location) {
      return res.status(400).json({ message: "Không tìm thấy dữ liệu vị trí" });
    }

    await User.findByIdAndUpdate(req.user.id, { location });
    
    res.status(200).json({ success: true, message: "Cập nhật vị trí thành công", location });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lưu vị trí" });
  }
});

router.put("/change-password", protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    if (user.password !== oldPassword) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng!" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi đổi mật khẩu" });
  }
});

router.get("/users", protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy danh sách user" });
  }
});

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

router.delete("/users/:id", protect, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa user thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa user" });
  }
});

module.exports = router;