const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true } // Nút bật/tắt thủ công
}, { timestamps: true });

module.exports = mongoose.model("Banner", bannerSchema);