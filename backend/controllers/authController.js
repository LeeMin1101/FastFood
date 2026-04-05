const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Khởi tạo client Google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Hàm xử lý Đăng nhập Google
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body; // Mã token Frontend gửi lên

    // 1. Xác thực token với Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    // 2. Lấy thông tin user từ Google trả về
    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload; // sub là ID duy nhất của user trên Google

    // 3. Tìm user trong Database của bạn
    let user = await User.findOne({ email });

    if (!user) {
      // Nếu chưa có, tạo user mới với mật khẩu rỗng (vì họ đăng nhập bằng Google)
      // Lưu ý: Cần update Schema User để cho phép password có thể null nếu đăng nhập bằng Google
      user = new User({
        name: name,
        email: email,
        avatar: picture,
        googleId: sub,
        role: "user"
      });
      await user.save();
    }

    // 4. Tạo JWT Token của hệ thống mình (giống hệt lúc login bình thường)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Đăng nhập Google thành công",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("Lỗi Google Login:", error);
    res.status(400).json({ error: "Xác thực Google thất bại" });
  }
};