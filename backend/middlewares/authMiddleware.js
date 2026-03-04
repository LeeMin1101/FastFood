const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = (req, res, next) => {
  try {
    // Lấy Token từ Header
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Vui lòng đăng nhập để thực hiện chức năng này" });
    }

    // Giải mã Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded; 
    
    next(); // Cho phép đi tiếp vào hàm xử lý (Controller)
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
// --------------------------------
const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Không có quyền truy cập" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (user && user.role === "admin") {
      next(); // Cho phép đi tiếp vào Controller
    } else {
      res.status(403).json({ message: "Bạn không có quyền Admin" });
    }
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

module.exports = { protect, isAdmin };