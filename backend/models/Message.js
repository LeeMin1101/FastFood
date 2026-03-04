const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  clientId: String, // Dùng username hoặc email của user làm ID phòng chat
  clientName: String,
  sender: String, // 'user' hoặc 'admin'
  text: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", MessageSchema);