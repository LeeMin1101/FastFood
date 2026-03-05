const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");

const { protect, isAdmin } = require("../middlewares/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, "avatar-" + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ==========================================
// 1. CÁC API XÁC THỰC (AUTH)
// ==========================================
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

// ==========================================
// 2. CÁC API NGƯỜI DÙNG (USER)
// ==========================================
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
    const user = await User.findByIdAndUpdate(req.user.id, { location: req.body.location }, { new: true });
    res.json(user);
  } catch(error) {
    res.status(500).json({ message: "Lỗi cập nhật vị trí" });
  }
});

// ==========================================
// 3. CÁC API QUẢN TRỊ (ADMIN)
// ==========================================
router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/users/:id", isAdmin, async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;
    if (password && password.trim() !== "") user.password = password;

    await user.save();
    
    const userResponse = await User.findById(req.params.id).select("-password");
    res.json({ message: "Cập nhật thành công", user: userResponse });
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

// các api quên mật khẩu
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại trong hệ thống!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 5 * 60 * 1000; 
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hoitruongzero@gmail.com",
        pass: "dhfj erbk drys pkml",
      },
    });

    const mailOptions = {
      from: '"MTK FastFood" <hoitruongzero@gmail.com>',
      to: user.email,
      subject: "Mã Xác Nhận OTP - MTK FastFood",
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 500px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 15px; text-align: center;">
          <h2 style="color: #FF4747;">MTK FastFood</h2>
          <p>Mã OTP để đặt lại mật khẩu của bạn là:</p>
          <h1 style="color: #FF4747; letter-spacing: 5px; background: #FFF0F0; padding: 15px; border-radius: 10px; display: inline-block;">${otp}</h1>
          <p>Mã có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Mã OTP 6 số đã được gửi tới email của bạn!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống khi gửi email." });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại!" });
    if (user.resetOtp !== otp) return res.status(400).json({ message: "Mã OTP không chính xác!" });
    if (user.resetOtpExpire < Date.now()) return res.status(400).json({ message: "Mã OTP đã hết hạn!" });

    res.json({ message: "Xác nhận OTP thành công! Vui lòng nhập mật khẩu mới." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.resetOtp !== otp || user.resetOtpExpire < Date.now()) {
      return res.status(400).json({ message: "Yêu cầu không hợp lệ. Vui lòng thử lại từ đầu." });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

module.exports = router;