# 🍔 MTK FastFood - Hệ Thống Đặt Đồ Ăn & Quản Lý Nhà Hàng Trực Tuyến

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-1A73E8?style=for-the-badge&logo=google&logoColor=white)

Một nền tảng thương mại điện tử chuyên biệt cho cửa hàng thức ăn nhanh, cung cấp trải nghiệm đặt món mượt mà cho khách hàng và hệ thống quản trị (Dashboard) toàn diện cho chủ quán. Dự án được tích hợp trí tuệ nhân tạo (AI Chatbot) và hệ thống giao tiếp thời gian thực.

## 🌟 Tính Năng Nổi Bật

### 👨‍💻 Dành cho Khách Hàng (Client)
* **Mua sắm thông minh:** Xem thực đơn, tìm kiếm món ăn, chọn size/topping linh hoạt.
* **Đặt bàn trực tuyến:** Sơ đồ nhà hàng trực quan, hiển thị bàn trống/đã đặt theo thời gian thực.
* **AI ChatBot (Gemini):** Trợ lý ảo AI tư vấn món ăn và giải đáp thắc mắc tự động 24/7.
* **Thanh toán:** Hỗ trợ thanh toán Tiền mặt (COD) và Chuyển khoản quét mã QR (VietQR).
* **Theo dõi đơn hàng:** Xem tiến trình đơn hàng (Chờ xác nhận -> Đang chuẩn bị -> Đang giao -> Đã giao).
* **Hệ thống VIP:** Tích lũy chi tiêu để thăng hạng thành viên.

### 👑 Dành cho Quản Trị Viên (Admin Dashboard)
* **Thống kê & Báo cáo:** Biểu đồ doanh thu, số lượng đơn hàng, top khách hàng chi tiêu cao (Recharts).
* **Quản lý Đơn hàng & Đặt bàn:** Thay đổi trạng thái đơn, thao tác đóng/mở bàn trực tiếp trên sơ đồ.
* **Quản lý Kho:** Thêm, sửa, xóa sản phẩm, danh mục, hình ảnh.
* **Live Chat CSKH:** Nhận tin nhắn từ khách hàng và phản hồi trực tiếp (thông qua Socket.io).
* **Quản lý Banner & User:** Điều chỉnh banner quảng cáo, phân quyền tài khoản (Admin/User).

## 🛠️ Công Nghệ Sử Dụng

* **Frontend:** React.js, Tailwind CSS, Framer Motion (Hiệu ứng), Redux Toolkit (Quản lý State).
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB Atlas, Mongoose.
* **Real-time:** Socket.io.
* **AI Integration:** Google Generative AI (Gemini 2.5 Flash).
* **Khác:** Axios, JWT (JSON Web Tokens) bảo mật xác thực, Helmet & Express-rate-limit.

## 📸 Hình Ảnh Demo

> **Gợi ý:** Bạn hãy chụp ảnh màn hình trang web của bạn (Trang chủ, Trang Đặt món, Sơ đồ đặt bàn, Admin Dashboard) và kéo thả trực tiếp vào giao diện edit README của GitHub. Nó sẽ tự động tạo link ảnh, bạn chỉ cần thay thế vào các dòng dưới đây!

* **Trang Chủ & Thực Đơn**
    *(Chèn ảnh tại đây)*
* **Luồng Thanh Toán & Mã QR**
    *(Chèn ảnh tại đây)*
* **Giao Diện Quản Trị (Dashboard)**
    *(Chèn ảnh tại đây)*

## 🚀 Hướng Dẫn Cài Đặt (Chạy Local)

Làm theo các bước sau để chạy dự án trên máy tính cá nhân:

**1. Clone kho lưu trữ về máy:**
```bash
git clone [https://github.com/LeeMin1101/FastFood.git](https://github.com/LeeMin1101/FastFood.git)
cd FastFood
