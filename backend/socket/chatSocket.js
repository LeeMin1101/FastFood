const Message = require("../models/Message");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo Gemini AI với API Key từ file .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`Kết nối mới: ${socket.id}`);

    // 1. Khi User (khách) mở chat, tải lịch sử tin nhắn của họ
    socket.on("join_chat", async (clientId) => {
      socket.join(clientId); // Gom user này vào 1 "phòng" cố định dựa trên ID của họ
      try {
        const history = await Message.find({ clientId }).sort({ createdAt: 1 });
        socket.emit("load_history", history);
      } catch (error) {
        console.error("Lỗi lấy lịch sử chat:", error);
      }
    });

    // 2. Khi Admin vào Dashboard, tải TẤT CẢ tin nhắn của mọi khách
    socket.on("admin_join", async () => {
      socket.join("admin_room");
      try {
        const allMessages = await Message.find().sort({ createdAt: 1 });
        socket.emit("admin_load_history", allMessages);
      } catch (error) {
        console.error("Lỗi lấy lịch sử chat cho admin:", error);
      }
    });

    // 3. User gửi tin nhắn -> GỌI GEMINI AI ĐỂ PHẢN HỒI
    socket.on("user_send_message", async (data) => {
      try {
        // 3.1. Lưu tin nhắn của khách vào DB
        const newMsg = new Message({
          clientId: data.clientId,
          clientName: data.senderName,
          sender: "user",
          text: data.message
        });
        await newMsg.save();

        // Bắn thông báo lên cho Admin
        io.to("admin_room").emit("admin_receive_message", newMsg);

        //Bật hiệu ứng "AI đang gõ..." trên màn hình khách
        io.to(data.clientId).emit("bot_typing", true);
        // múi giờ đúng chuẩn
        const currentDateTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

        // Cấu hình Prompt và gọi Gemini
const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          tools: [
            {
              googleSearch: {} // Kích hoạt công cụ tìm kiếm Google
            }
          ]
        });

        const prompt = `
          Bạn là trợ lý ảo AI thông minh, vui tính của cửa hàng thức ăn nhanh MTK FastFood.
          Tên của bạn là "AI MTK".
          
          [BỐI CẢNH THỰC TẾ]: Hôm nay là ${currentDateTime} tại Việt Nam.
          
          - Nếu khách hỏi về đồ ăn, thực đơn, đặt món: Hãy tư vấn nhiệt tình, hấp dẫn.
          - Nếu khách hỏi kiến thức xã hội, lịch sử, toán học, hay các sự kiện hiện tại: Hãy dùng công cụ tìm kiếm để trả lời chính xác thông tin cập nhật mới nhất, ngắn gọn và giữ thái độ thân thiện.
          - TUYỆT ĐỐI KHÔNG dùng định dạng Markdown phức tạp (như in đậm **, dấu sao *...) trong câu trả lời. Chỉ dùng văn bản thuần túy và emoji.
          
          Khách hàng vừa nhắn: "${data.message}"
        `;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 3.4. Lưu câu trả lời của AI vào DB (Lưu dưới danh nghĩa Admin để UI hiện bên trái)
        const aiMsg = new Message({
          clientId: data.clientId,
          clientName: "AI MTK",
          sender: "admin", 
          text: responseText
        });
        await aiMsg.save();

        // 3.5. Bắn câu trả lời về cho khách và cập nhật lên màn hình Admin
        io.to(data.clientId).emit("user_receive_message", aiMsg);
        io.to("admin_room").emit("admin_receive_message", aiMsg);

      } catch (error) {
        console.error("Lỗi xử lý tin nhắn hoặc Gemini API:", error);
        
        // Nếu Gemini bị lỗi, báo cho khách biết
        const errorMsg = new Message({
          clientId: data.clientId,
          clientName: "System",
          sender: "admin",
          text: "Bộ não AI đang khò khò, bạn vui lòng đợi admin phải hồi nhóooooo"
        });
        await errorMsg.save();
        io.to(data.clientId).emit("user_receive_message", errorMsg);
        io.to("admin_room").emit("admin_receive_message", errorMsg);

      } finally {
        // Tắt hiệu ứng "đang gõ" dù thành công hay thất bại
        io.to(data.clientId).emit("bot_typing", false);
      }
    });

    // 4. Admin trả lời
    socket.on("admin_reply_message", async (data) => {
      try {
        const newMsg = new Message({
          clientId: data.targetClientId,
          clientName: data.clientName,
          sender: "admin",
          text: data.message
        });
        await newMsg.save(); // Lưu vào DB

        // Bắn trực tiếp về "phòng" của đúng người khách đó
        io.to(data.targetClientId).emit("user_receive_message", newMsg);
        // Bắn ngược lại màn hình Admin (để đồng bộ nếu admin mở nhiều tab)
        io.to("admin_room").emit("admin_receive_message", newMsg);
      } catch (error) {
        console.error("Lỗi admin gửi tin nhắn:", error);
      }
    });

    // 5. Admin xóa đoạn chat
    socket.on("admin_clear_chat", async (clientId) => {
      try {
        // xóa tin nhắn user trong dbbase
        await Message.deleteMany({ clientId: clientId });
        
        // Gửi lệnh yêu cầu màn hình khách hàng tự động reset khung chat
        io.to(clientId).emit("server_clear_chat");
      } catch (error) {
        console.error("Lỗi khi xóa chat:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Mất kết nối: ${socket.id}`);
    });
  }); 
};