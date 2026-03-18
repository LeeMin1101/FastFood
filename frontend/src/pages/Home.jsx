import React, { useState, useEffect } from "react";
import axios from "axios";
import Banner from "../components/Banner";
import CategoryFilter from "../components/CategoryFilter";
import ProductCard from "../components/ProductCard";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SERVER_URL } from "../config";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [products, setProducts] = useState([]); 

  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get("search") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/products`);
        setProducts(response.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchCategory = activeCategory === "Tất cả" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-gray-900 via-orange-900 to-red-900">
      <Banner />
      <main id="food-menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 mt-[-20px]">
        
        <CategoryFilter activeCategory={activeCategory} setCategory={setActiveCategory} />

        {searchKeyword && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 mb-2 flex items-center justify-between bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl px-6 py-4 shadow-xl"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Kết quả tìm kiếm cho: <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent font-black">"{searchKeyword}"</span>
            </h2>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              onClick={() => window.location.href = '/'} 
              className="text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-4 py-2 rounded-full transition-all shadow-lg"
            >
              Hủy tìm kiếm
            </motion.button>
          </motion.div>
        )}

        {filteredProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white/10 backdrop-blur-xl rounded-3xl mt-8 shadow-2xl border border-white/20"
          >
            <motion.span 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4 inline-block"
            >
              🍔
            </motion.span>
            <h3 className="text-2xl font-bold text-white">Rất tiếc!</h3>
            <p className="text-gray-300 mt-2 font-medium">
              Không tìm thấy món ăn nào phù hợp với yêu cầu của bạn.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8"
          >
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
        
      </main>
    </div>
  );
}