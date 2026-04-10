import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUploadCloud, FiMaximize, FiCheckCircle, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import axios from "axios";

export default function AIFoodScan() {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  // Xử lý khi người dùng chọn ảnh
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null); // Reset kết quả cũ
    }
  };

  // Hàm gửi ảnh cho AI nhận diện (Đã mở khóa kết nối API thật)
  const handleScanFood = async () => {
    if (!imageFile) return;
    
    setIsScanning(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      
      // Gọi API Backend Python (Port 5000)
      const response = await axios.post("http://localhost:5000/api/predict-food", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setResult(response.data);
      setIsScanning(false);

    } catch (error) {
      console.error("Lỗi khi nhận diện:", error);
      setResult({ error: "Không thể kết nối đến AI Server. Vui lòng đảm bảo server Python đang chạy." });
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-24 md:py-32 font-sans text-gray-900 flex items-center justify-center">
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 text-white mb-6 shadow-lg shadow-orange-500/30"
          >
            <FiMaximize className="text-3xl" />
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-900 mb-4">
            AI Nhận Diện Món Ăn
          </h1>
          <p className="text-gray-500 font-medium max-w-2xl mx-auto">
            Sử dụng trí tuệ nhân tạo (EfficientNetV2) để phân tích hình ảnh và nhận diện chính xác các món ăn trong nháy mắt. Tải ảnh của bạn lên ngay!
          </p>
        </div>

        {/* Khung chính */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-10 flex flex-col md:flex-row gap-10">
          
          {/* CỘT TRÁI: Tải ảnh & Hiển thị */}
          <div className="w-full md:w-1/2 flex flex-col">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">1. Tải ảnh món ăn</h3>
            
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />

            {preview ? (
              // HIỂN THỊ ẢNH ĐÃ CHỌN
              <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner group">
                <img src={preview} alt="Food preview" className="w-full h-full object-cover" />
                
                {/* Lớp overlay nút đổi ảnh khi chưa quét */}
                {!isScanning && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => fileInputRef.current.click()} className="bg-white/20 backdrop-blur-md border border-white/40 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-white/30 transition-all">
                      <FiRefreshCw /> Chọn ảnh khác
                    </button>
                  </div>
                )}

                {/* HIỆU ỨNG TIA LASER SCANNING CỰC XỊN */}
                {isScanning && (
                  <>
                    <div className="absolute inset-0 bg-orange-500/10 backdrop-blur-[1px]"></div>
                    <motion.div 
                      className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_20px_rgba(249,115,22,1)] z-10"
                      animate={{ top: ["0%", "98%", "0%"] }}
                      transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                    />
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <FiMaximize className="animate-spin" /> AI đang phân tích...
                    </div>
                  </>
                )}
              </div>
            ) : (
              // KHUNG DROP ẢNH KHI CHƯA CÓ ẢNH
              <div 
                onClick={() => fileInputRef.current.click()}
                className="w-full h-80 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 hover:border-orange-400 transition-all group"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <FiUploadCloud className="text-3xl text-gray-400 group-hover:text-orange-500 transition-colors" />
                </div>
                <p className="font-bold text-gray-600 mb-1">Click để tải ảnh lên</p>
                <p className="text-xs text-gray-400 font-medium">Hỗ trợ JPG, PNG, JPEG</p>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: Nút Quét & Hiển thị Kết quả */}
          <div className="w-full md:w-1/2 flex flex-col">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">2. Nhận diện món ăn</h3>
            
            {/* Nút bấm Scan */}
            <button 
              onClick={handleScanFood} 
              disabled={!imageFile || isScanning}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-white flex items-center justify-center gap-3 transition-all shadow-lg ${
                !imageFile 
                  ? "bg-gray-300 cursor-not-allowed shadow-none" 
                  : isScanning 
                    ? "bg-gray-800 shadow-gray-800/30" 
                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/30 hover:-translate-y-1"
              }`}
            >
              {isScanning ? (
                <> <FiRefreshCw className="animate-spin text-xl" /> Đang xử lý... </>
              ) : (
                <> <FiMaximize className="text-xl" /> Quét Hình Ảnh </>
              )}
            </button>

            {/* Khung hiển thị kết quả */}
            <AnimatePresence mode="wait">
              {result && !isScanning && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-8 p-6 rounded-2xl border-2 shadow-sm flex flex-col h-full ${
                    result.error || result.label === "Không xác định" 
                      ? "bg-red-50 border-red-200" 
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-500">Kết quả phân tích</h4>
                  
                  {result.error ? (
                    <div className="flex flex-col items-center text-center my-auto">
                      <FiAlertCircle className="text-5xl text-red-500 mb-3" />
                      <p className="font-bold text-red-600">{result.error}</p>
                    </div>
                  ) : result.label === "Không xác định" ? (
                    <div className="flex flex-col items-center text-center my-auto">
                      <FiAlertCircle className="text-5xl text-orange-500 mb-3" />
                      <p className="text-xl font-black text-gray-900 mb-2">Không Thể Xác Định</p>
                      <p className="text-sm font-medium text-gray-600">Độ tin cậy quá thấp ({result.confidence}%). Vui lòng thử một bức ảnh rõ nét hơn.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl">
                          <FiCheckCircle />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-500">Món ăn dự đoán</p>
                          <p className="text-2xl md:text-3xl font-black text-gray-900">{result.label}</p>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-gray-600">Độ tin cậy (Confidence)</span>
                          <span className="text-sm font-black text-green-600">{result.confidence}%</span>
                        </div>
                        <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-gray-200 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="bg-green-500 h-full rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
}