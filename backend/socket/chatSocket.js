const Message = require("../models/Message");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`🟢 Kết nối mới: ${socket.id}`);

    // 1. Khi User (khách) mở chat, tải lịch sử tin nhắn của họ
    socket.on("join_chat", async (clientId) => {
      socket.join(clientId); // Gom user này vào 1 "phòng" cố định dựa trên ID của họ
      const history = await Message.find({ clientId }).sort({ createdAt: 1 });
      socket.emit("load_history", history);
    });

    // 2. Khi Admin vào Dashboard, tải TẤT CẢ tin nhắn của mọi khách
    socket.on("admin_join", async () => {
      socket.join("admin_room");
      const allMessages = await Message.find().sort({ createdAt: 1 });
      socket.emit("admin_load_history", allMessages);
    });

    // 3. User gửi tin nhắn
    socket.on("user_send_message", async (data) => {
      const newMsg = new Message({
        clientId: data.clientId,
        clientName: data.senderName,
        sender: "user",
        text: data.message
      });
      await newMsg.save(); // Lưu vào DB

      // Bắn thông báo lên cho Admin
      io.to("admin_room").emit("admin_receive_message", newMsg);
    });

    // 4. Admin trả lời
    socket.on("admin_reply_message", async (data) => {
      const newMsg = new Message({
        clientId: data.targetClientId,
        clientName: data.clientName,
        sender: "admin",
        text: data.message
      });
      await newMsg.save(); // Lưu vào DB

      // Bắn trực tiếp về "phòng" của đúng người khách đó
      io.to(data.targetClientId).emit("user_receive_message", newMsg);
    });

    // 5. Admin xóa đoạn chat (ĐÃ ĐƯA VÀO ĐÚNG CHỖ VÀ DÙNG DB)
    socket.on("admin_clear_chat", async (clientId) => {
      try {
        // Xóa tận gốc toàn bộ tin nhắn của khách này trong Database
        await Message.deleteMany({ clientId: clientId });
        
        // Gửi lệnh yêu cầu màn hình khách hàng tự động reset khung chat
        io.to(clientId).emit("server_clear_chat");
      } catch (error) {
        console.error("Lỗi khi xóa chat:", error);
      }
    });

  }); 
};