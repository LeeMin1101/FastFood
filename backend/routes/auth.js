const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const { protect, isAdmin } = require("../middlewares/authMiddleware"); 

// --- CẤU HÌNH MULTER ĐỂ LƯU ẢNH AVATAR ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Lưu vào thư mục uploads
  },
  filename: (req, file, cb) => {
    // Đổi tên file: avatar - thời gian hiện tại - đuôi file gốc (VD: avatar-17091234.png)
    cb(null, "avatar-" + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// [POST] ĐĂNG KÝ 
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

// [POST] ĐĂNG NHẬP 
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
      // Đã bổ sung thêm avatar và phone trả về cho Frontend
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

// [PUT] CẬP NHẬT THÔNG TIN CÁ NHÂN VÀ AVATAR (MỚI)
router.put("/profile", protect, upload.single("avatar"), async (req, res) => {
  try {
    const { name, phone } = req.body;
    let updateData = { name, phone };
    
    // Nếu req.file tồn tại nghĩa là user có upload ảnh mới
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    // Cập nhật vào Database và trả về thông tin mới (trừ password)
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      updateData, 
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CÁC API QUẢN LÝ (Admin) ---
router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/users/:id", isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa tài khoản" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}); 

// --- CẬP NHẬT VỊ TRÍ NGƯỜI DÙNG ---
router.put("/update-location", protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { location: req.body.location },
      { new: true }
    );
    res.json(user);
  } catch(error) {
    res.status(500).json({ message: "Lỗi cập nhật vị trí" });
  }
});

module.exports = router;