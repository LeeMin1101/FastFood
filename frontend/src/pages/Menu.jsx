import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SERVER_URL } from "../config";

export default function Menu() {
  const [products, setProducts] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");

  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get("search") || "";
  const navigate = useNavigate();

  // Gọi API lấy danh sách sản phẩm và tự động trích xuất danh mục
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/products`);
        const data = response.data;
        setProducts(data);

        // Tự động lọc ra các danh mục không trùng lặp từ dữ liệu sản phẩm
        let uniqueCategories = [...new Set(data.map(item => item.category))];
        
        // XỬ LÝ ĐƯA GÀ RÁN LÊN ĐẦU
        // Lưu ý: Tên này phải khớp 100% với tên danh mục bạn lưu trong Database (viết hoa/viết thường)
        const mainCategory = "Gà Rán"; 
        if (uniqueCategories.includes(mainCategory)) {
          // Xóa Gà Rán ở vị trí cũ và chèn nó lên đầu mảng
          uniqueCategories = [
            mainCategory,
            ...uniqueCategories.filter(cat => cat !== mainCategory)
          ];
        }

        setCategories(uniqueCategories);
        
        // Tự động chọn danh mục đầu tiên (lúc này chắc chắn là Gà Rán nếu quán có Gà Rán) làm mặc định
        if (uniqueCategories.length > 0) {
          setActiveCategory(uniqueCategories[0]);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      }
    };
    fetchProducts();
  }, []);

  // Lọc sản phẩm: Nếu có tìm kiếm thì tìm toàn bộ, nếu không thì lọc theo danh mục
  const filteredProducts = products.filter((p) => {
    if (searchKeyword) {
      return p.name.toLowerCase().includes(searchKeyword.toLowerCase());
    }
    return p.category === activeCategory;
  });

  const clearSearch = () => {
    navigate("/menu");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 pt-32 pb-24 font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tiêu đề trang được Redesign */}
        <div className="flex flex-col items-center justify-center mb-12">
          <span className="text-orange-500 font-bold tracking-[0.3em] text-xs md:text-sm uppercase mb-4">
            Tinh hoa ẩm thực
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest relative pb-6">
            Thực Đơn
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></span>
          </h1>
        </div>

        {/* Thông báo kết quả tìm kiếm (Ưu tiên hiển thị nếu có search) */}
        {searchKeyword ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex flex-col sm:flex-row items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 shadow-xl gap-4"
          >
            <h2 className="text-lg md:text-xl font-bold text-white text-center sm:text-left">
              Kết quả tìm kiếm: <span className="text-orange-400">"{searchKeyword}"</span>
            </h2>
            <button 
              onClick={clearSearch} 
              className="text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-2.5 rounded-xl transition-colors"
            >
              Hủy tìm kiếm
            </button>
          </motion.div>
        ) : (
          /* Bộ lọc danh mục mới (Chỉ hiện khi không tìm kiếm) */
          <div className="flex overflow-x-auto hide-scrollbar justify-start md:justify-center gap-3 mb-12 pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-7 py-3 rounded-full font-bold text-sm tracking-wide whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat 
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30" 
                    : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Danh sách sản phẩm */}
        {filteredProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl"
          >
            <h3 className="text-2xl font-bold text-white mb-2">Không tìm thấy món ăn</h3>
            <p className="text-gray-400 text-center max-w-md">
              Rất tiếc, chúng tôi không tìm thấy món ăn nào phù hợp với yêu cầu của bạn.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="h-full"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
        
      </main>

      {/* CSS ẩn thanh cuộn ngang cho thanh danh mục trên điện thoại */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}