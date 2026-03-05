const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");
const Order = require("../models/Order"); // Nhớ tạo model Order nếu bạn lưu vào DB

// [POST] TẠO LINK THANH TOÁN MOMO
router.post("/momo", async (req, res) => {
  try {
    const { amount, orderInfo, orderId } = req.body;

    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    
    const requestId = partnerCode + new Date().getTime();
    const redirectUrl = "http://localhost:5173/payment-result"; // Link trả về sau khi thanh toán
    const ipnUrl = "http://localhost:3000/api/payment/callback"; // Link webhook (bỏ qua nếu chạy localhost)
    const requestType = "captureWallet";
    const extraData = ""; 

    // Tạo chuỗi chữ ký (signature) theo đúng format của MoMo
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    
    // Băm chữ ký bằng HMAC SHA256
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode,
      partnerName: "MTK FastFood",
      storeId: "MomoTestStore",
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: "vi",
      requestType,
      autoCapture: true,
      extraData,
      signature,
    };

    // Gửi request sang MoMo
    const result = await axios.post(process.env.MOMO_API_URL, requestBody, {
      headers: { "Content-Type": "application/json" }
    });

    // MoMo trả về 1 cái link (payUrl), gửi nó về cho Frontend
    res.status(200).json({ payUrl: result.data.payUrl });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi tạo thanh toán MoMo" });
  }
});

module.exports = router;