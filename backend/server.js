const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");

// ---> 1. Nhúng thư viện http và socket.io
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// ---> 2. Tạo server HTTP từ app Express
const server = http.createServer(app);

// ---> 3. Khởi tạo cấu hình Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

connectDB();

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());

// Phục vụ file ảnh tĩnh
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/banners", require("./routes/banner"));
app.use("/api/payment", require("./routes/payment"));

app.get("/", (req, res) => {
  res.send("Fast Food API is running 🚀");
});

// ---> 4. Nhúng file xử lý logic chat và truyền io vào
require("./socket/chatSocket")(io);

const PORT = process.env.PORT || 3000;

// ---> 5. THAY ĐỔI QUAN TRỌNG: Dùng server.listen thay vì app.listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});