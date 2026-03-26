const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Danh sách domain được phép gọi API
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://fastfood-1-oav2.onrender.com"
];

// Cấu hình Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

connectDB();

// Bảo mật HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Phục vụ ảnh tĩnh
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Chống spam cho api xác thực (15 phút / 5 lần)
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 10,
  message: { message: "Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút" }
});

// Routes
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/banners", require("./routes/banner"));
app.use("/api/payment", require("./routes/payment"));
app.use('/api/table-orders', require('./routes/TableOrder'));
app.use('/api/tables', require('./routes/tableRoutes'));

app.get("/", (req, res) => {
  res.send("Fast Food API is running");
});

// Nhúng socket
require("./socket/chatSocket")(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});