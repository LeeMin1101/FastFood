import React, { useState, useEffect } from "react";
import axios from "axios";
import Banner from "../components/Banner";
import CategoryFilter from "../components/CategoryFilter";
import ProductCard from "../components/ProductCard";
import { useSearchParams } from "react-router-dom";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [products, setProducts] = useState([]); 

  // 1. LẤY TỪ KHÓA TÌM KIẾM TỪ URL
  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get("search") || "";

  // Kéo dữ liệu thật từ Backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("https://mtk-fastfood.onrender.com/api/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      }
    };
    fetchProducts();
  }, []);

  // 2. NÂNG CẤP BỘ LỌC KÉP: Lọc theo Danh mục VÀ lọc theo Từ khóa
  const filteredProducts = products.filter((p) => {
    // Kiểm tra xem món ăn có thuộc danh mục đang chọn không
    const matchCategory = activeCategory === "Tất cả" || p.category === activeCategory;
    
    // Kiểm tra xem tên món ăn có chứa từ khóa không (chuyển hết về chữ thường để so sánh cho chuẩn)
    const matchSearch = p.name.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchCategory && matchSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Banner />
      <main id="food-menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 mt-[-20px]">
        
        {/* Thanh lọc theo danh mục */}
        <CategoryFilter activeCategory={activeCategory} setCategory={setActiveCategory} />

        {/* THÔNG BÁO TỪ KHÓA TÌM KIẾM (Chỉ hiện khi có gõ tìm kiếm) */}
        {searchKeyword && (
          <div className="mt-8 mb-2 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Kết quả tìm kiếm cho: <span className="text-orange-500 font-black">"{searchKeyword}"</span>
            </h2>
            <button 
              onClick={() => window.location.href = '/'} // Xóa filter để quay về ban đầu
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Hủy tìm kiếm
            </button>
          </div>
        )}

        {/* HIỂN THỊ DANH SÁCH MÓN ĂN HOẶC THÔNG BÁO KHÔNG TÌM THẤY */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl mt-8 shadow-sm border border-gray-100">
            <span className="text-6xl mb-4">🍔</span>
            <h3 className="text-2xl font-bold text-gray-800">Rất tiếc!</h3>
            <p className="text-gray-500 mt-2 font-medium">
              Không tìm thấy món ăn nào phù hợp với yêu cầu của bạn.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
        
      </main>
    </div>
  );
}