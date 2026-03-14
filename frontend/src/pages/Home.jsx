import React, { useState, useEffect } from "react";
import axios from "axios";
import Banner from "../components/Banner";
import CategoryFilter from "../components/CategoryFilter";
import ProductCard from "../components/ProductCard";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [products, setProducts] = useState([]); 

  // thêm navigate
  const navigate = useNavigate();

  // kiểm tra login khi thêm vào cart
  const handleAddToCart = (product) => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      alert("Vui lòng đăng nhập để thêm món vào giỏ hàng!");
      navigate("/login");
      return;
    }

    // dispatch(addToCart(product));
  };

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

  // 2. Lọc danh mục + từ khóa
  const filteredProducts = products.filter((p) => {
    const matchCategory = activeCategory === "Tất cả" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Banner />
      <main id="food-menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 mt-[-20px]">
        
        <CategoryFilter activeCategory={activeCategory} setCategory={setActiveCategory} />

        {searchKeyword && (
          <div className="mt-8 mb-2 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Kết quả tìm kiếm cho: <span className="text-orange-500 font-black">"{searchKeyword}"</span>
            </h2>
            <button 
              onClick={() => window.location.href = '/'}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Hủy tìm kiếm
            </button>
          </div>
        )}

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
              <ProductCard
                key={product._id}
                product={product}
                handleAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
        
      </main>
    </div>
  );
}