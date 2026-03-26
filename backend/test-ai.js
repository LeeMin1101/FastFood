require('dotenv').config();

async function checkModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log("❌ Không tìm thấy GEMINI_API_KEY trong file .env");
      return;
    }

    console.log("⏳ Đang quét danh sách model hợp lệ cho API Key của bạn...");
    
    // Gọi thẳng lên server Google để lấy danh sách
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      console.log("❌ Lỗi từ Google:", data.error.message);
      return;
    }

    console.log("✅ CÁC MODEL BẠN ĐƯỢC PHÉP SỬ DỤNG (Hãy copy 1 cái có chữ 'generateContent'):");
    data.models.forEach(m => {
      // Chỉ lọc ra những model hỗ trợ chat/tạo text
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log(`👉 Tên model: "${m.name.replace('models/', '')}"`);
      }
    });

  } catch (error) {
    console.error("❌ Lỗi kết nối:", error.message);
  }
}

checkModels();