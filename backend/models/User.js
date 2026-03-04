const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true, // Đảm bảo không trùng tên đăng nhập
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    location: {
      type: String,
      default: "chưa xác định"
    },
    // --- THÊM TRƯỜNG AVATAR VÀO ĐÂY ---
    avatar: {
      type: String,
      default: "" // Mặc định rỗng, khi đó frontend sẽ hiển thị chữ cái đầu của tên
    }
  },
  { 
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);