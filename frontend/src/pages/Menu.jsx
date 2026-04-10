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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/products`);
        const data = response.data;
        setProducts(data);

        let uniqueCategories = [...new Set(data.map(item => item.category))];
        
        const mainCategory = "Gà Rán"; 
        if (uniqueCategories.includes(mainCategory)) {
          uniqueCategories = [
            mainCategory,
            ...uniqueCategories.filter(cat => cat !== mainCategory)
          ];
        }

        setCategories(uniqueCategories);
        
        if (uniqueCategories.length > 0) {
          setActiveCategory(uniqueCategories[0]);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      }
    };
    fetchProducts();
  }, []);

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
    <div className="min-h-screen bg-gray-50 pt-32 pb-24 font-sans text-gray-800">
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col items-center justify-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-orange-500 font-bold tracking-[0.3em] text-xs md:text-sm uppercase mb-4"
          >
            Tinh hoa ẩm thực
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 uppercase tracking-tight relative pb-6"
          >
            Thực Đơn
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-orange-500 rounded-full"></div>
          </motion.h1>
        </div>

        {searchKeyword ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-200 rounded-2xl px-8 py-5 shadow-sm gap-4"
          >
            <h2 className="text-lg md:text-xl font-bold text-gray-900 text-center sm:text-left">
              Kết quả tìm kiếm: <span className="text-orange-500">"{searchKeyword}"</span>
            </h2>
            <button 
              onClick={clearSearch} 
              className="text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-6 py-3 rounded-xl transition-all duration-300"
            >
              Hủy tìm kiếm
            </button>
          </motion.div>
        ) : (
          <div className="flex overflow-x-auto hide-scrollbar justify-start md:justify-center gap-3 mb-16 pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat 
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30 border-transparent" 
                    : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm"
          >
            <span className="text-6xl mb-6 opacity-40">🍔</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy món ăn</h3>
            <p className="text-gray-500 text-center max-w-md text-sm md:text-base">
              Rất tiếc, chúng tôi không tìm thấy món ăn nào phù hợp với yêu cầu của bạn. Vui lòng thử lại với từ khóa khác.
            </p>
            {searchKeyword && (
              <button 
                onClick={clearSearch} 
                className="mt-8 border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-900 hover:text-white transition-colors duration-300"
              >
                Xem Toàn Bộ Thực Đơn
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
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

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}