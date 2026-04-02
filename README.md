# 🍔 MTK FastFood - Hệ Thống Đặt Đồ Ăn & Quản Lý Nhà Hàng Trực Tuyến

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-1A73E8?style=for-the-badge&logo=google&logoColor=white)

Một nền tảng thương mại điện tử chuyên biệt cho cửa hàng thức ăn nhanh, cung cấp trải nghiệm đặt món mượt mà cho khách hàng và hệ thống quản trị (Dashboard) toàn diện cho chủ quán. Dự án được tích hợp trí tuệ nhân tạo (AI Chatbot) và hệ thống giao tiếp thời gian thực.

## 🌟 Tính Năng Nổi Bật

### Dành cho Khách Hàng (Client)
* **Mua sắm thông minh:** Xem thực đơn, tìm kiếm món ăn, chọn size/topping linh hoạt.
* **Đặt bàn trực tuyến:** Sơ đồ nhà hàng trực quan, hiển thị bàn trống/đã đặt theo thời gian thực.
* **AI ChatBot (Gemini):** Trợ lý ảo AI tư vấn món ăn và giải đáp thắc mắc tự động 24/7.
* **Thanh toán:** Hỗ trợ thanh toán Tiền mặt (COD) và Chuyển khoản quét mã QR (VietQR).
* **Theo dõi đơn hàng:** Xem tiến trình đơn hàng (Chờ xác nhận -> Đang chuẩn bị -> Đang giao -> Đã giao).
* **Hệ thống VIP:** Tích lũy chi tiêu để thăng hạng thành viên.

### Dành cho Quản Trị Viên (Admin Dashboard)
* **Thống kê & Báo cáo:** Biểu đồ doanh thu, số lượng đơn hàng, top khách hàng chi tiêu cao (Recharts).
* **Quản lý Đơn hàng & Đặt bàn:** Thay đổi trạng thái đơn, thao tác đóng/mở bàn trực tiếp trên sơ đồ.
* **Quản lý Kho:** Thêm, sửa, xóa sản phẩm, danh mục, hình ảnh.
* **Live Chat CSKH:** Nhận tin nhắn từ khách hàng và phản hồi trực tiếp (thông qua Socket.io).
* **Quản lý Banner & User:** Điều chỉnh banner quảng cáo, phân quyền tài khoản (Admin/User).

## Công Nghệ Sử Dụng

* **Frontend:** React.js, Tailwind CSS, Framer Motion (Hiệu ứng), Redux Toolkit (Quản lý State).
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB Atlas, Mongoose.
* **Real-time:** Socket.io.
* **AI Integration:** Google Generative AI (Gemini 2.5 Flash).
* **Khác:** Axios, JWT (JSON Web Tokens) bảo mật xác thực, Helmet & Express-rate-limit.

## Hình Ảnh Demo

* **Trang Chủ & Thực Đơn**
  <img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/a0e7b364-8517-487b-8606-16608d6512e9" />
  <img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/f5954205-76dc-40d8-81ac-7e6fc8f93944" />
  <img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/d508231e-455c-4cd6-9a06-85641e161e77" />
  <img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/b890d140-6729-48df-a795-6f341b7845a3" />
  <img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/e168b874-9b9e-4a72-bcde-1cb29aa5c345" />
* **Luồng Thanh Toán & Mã QR**
  <img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/f4f8df03-8e96-4b3d-8ddd-a05fe6d75508" />
  <img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/9088fdc5-56e3-4714-8b4a-920edccf243b" />
* **ChatBox Tích Hợp AI**
   <img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/46bd872e-8b51-41e4-82ab-6d8239bcf50f" />
* **Tính Năng Đặt Bàn**
  <img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/9e45c8ed-d900-4f9e-bd40-78a89c40bf57" />

* **Giao Diện Quản Trị (Dashboard)**
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/de508479-83f2-4498-b7e3-a4a3b2aacc40" />
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/8ea683b3-a657-4d48-83e8-c92e095068af" />
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/23e5cfe7-a963-495e-a3f1-31d510287b49" />
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/7c62b9e5-c5ac-45cf-957a-c69311eafbef" />
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/af14ed8f-a81a-4a45-a26c-fddc45f79272" />
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/4bd856b6-ba06-4061-9605-4d6fbaf91281" />
* **Link Deploy:**
https://fastfood-1-oav2.onrender.com
**Tác Giả:**
Trương Lê Minh

Đại học Văn Lang (VLU)

Email: hoitruongzero@gmail.com
GitHub: @LeeMin1101
