import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { addToCart } from "../redux/cartSlice";
import { SERVER_URL } from "../config";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const imageRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [addedToCart, setAddedToCart] = useState(false);

  // Fetch product by ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${SERVER_URL}/api/products/${id}`);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi tải sản phẩm");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Format image URL
  const getImageUrl = (img) => {
    if (!img) return "/img/no-image.png";
    if (img.startsWith("http")) return img;
    if (!img.startsWith("/")) img = "/" + img;
    return `${SERVER_URL}${img}`;
  };

  // Handle image zoom
  const handleImageHover = (e) => {
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
    setIsZoomed(true);
  };

  const handleImageLeave = () => {
    setIsZoomed(false);
  };

  // Fly to cart animation
  const flyToCart = () => {
    const cart = document.getElementById("cart-icon");
    if (!cart || !imageRef.current) return;

    const imgClone = imageRef.current.cloneNode(true);
    const rect = imageRef.current.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();

    imgClone.style.position = "fixed";
    imgClone.style.left = rect.left + "px";
    imgClone.style.top = rect.top + "px";
    imgClone.style.width = rect.width + "px";
    imgClone.style.height = rect.height + "px";
    imgClone.style.transition = "all 0.8s cubic-bezier(0.25,0.46,0.45,0.94)";
    imgClone.style.borderRadius = "50%";
    imgClone.style.zIndex = "9999";
    imgClone.style.pointerEvents = "none";
    imgClone.style.boxShadow = "0 10px 30px rgba(229, 57, 53, 0.4)";

    document.body.appendChild(imgClone);

    setTimeout(() => {
      imgClone.style.left = cartRect.left + cartRect.width / 2 - 15 + "px";
      imgClone.style.top = cartRect.top + cartRect.height / 2 - 15 + "px";
      imgClone.style.width = "30px";
      imgClone.style.height = "30px";
      imgClone.style.opacity = "0";
    }, 50);

    setTimeout(() => {
      document.body.removeChild(imgClone);
    }, 800);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(product));
    }

    flyToCart();
    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  // Handle buy now
  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      navigate("/cart");
    }, 500);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
          <p className="text-gray-300 font-medium">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {error || "Không tìm thấy sản phẩm"}
          </h2>
          <p className="text-gray-300 mb-8">Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg"
          >
            <span>←</span> Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-orange-400 font-medium mb-8 transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Quay lại danh sách
        </Link>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left: Product Image */}
          <div className="flex items-center justify-center">
            <div
              ref={imageRef}
              className="relative w-full aspect-square bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden cursor-zoom-in group"
              onMouseMove={handleImageHover}
              onMouseLeave={handleImageLeave}
            >
              {/* Main Image */}
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? "scale-150" : "scale-100"
                }`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }
                    : {}
                }
              />

              {/* Zoom Indicator */}
              {!isZoomed && (
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>🔍</span> Hover để phóng to
                </div>
              )}

              {/* Availability Badge */}
              {product.isAvailable ? (
                <div className="absolute top-4 left-4 bg-green-500/80 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  ✓ Còn hàng
                </div>
              ) : (
                <div className="absolute top-4 left-4 bg-red-500/80 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  Hết hàng
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col justify-center">
            
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider border border-orange-500/30">
                {product.category}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating (Optional - can be extended later) */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-xl">
                    {i < 4 ? "⭐" : "☆"}
                  </span>
                ))}
              </div>
              <span className="text-gray-400 text-sm font-medium">(Đánh giá mẫu)</span>
            </div>

            {/* Price */}
            <div className="mb-8 p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
              <p className="text-gray-300 text-sm font-medium mb-2">Giá hiện tại</p>
              <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                {product.price.toLocaleString("vi-VN")}đ
              </p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-white mb-3">Mô tả sản phẩm</h3>
              <p className="text-gray-300 leading-relaxed text-base">
                {product.description || "Sản phẩm chất lượng cao từ MTK FastFood, được chế biến tươi hàng ngày."}
              </p>
            </div>

            {/* Nutrition Info */}
            <div className="mb-8 p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-orange-500/30 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔥</span>
                <div>
                  <p className="text-gray-300 text-sm font-medium">Năng lượng</p>
                  <p className="text-2xl font-bold text-orange-300">{product.calories} kcal</p>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-4">
              
              {/* Quantity Selector */}
              <div className="flex items-center gap-6 bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-lg">
                <span className="text-white font-semibold">Số lượng:</span>
                <div className="flex items-center border border-white/20 rounded-full bg-white/5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-xl font-bold text-gray-300 hover:text-orange-400 disabled:opacity-50 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 h-10 text-center font-bold text-white border-0 focus:outline-none bg-transparent"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-xl font-bold text-gray-300 hover:text-orange-400 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!product.isAvailable}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                  addedToCart
                    ? "bg-green-500 text-white"
                    : product.isAvailable
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:shadow-orange-500/50 active:scale-95"
                    : "bg-gray-600 text-gray-300 cursor-not-allowed"
                }`}
              >
                {addedToCart ? (
                  <>
                    <span>✓</span> Đã thêm vào giỏ!
                  </>
                ) : product.isAvailable ? (
                  <>
                    <span>🛒</span> Thêm vào giỏ ({quantity})
                  </>
                ) : (
                  "Hết hàng"
                )}
              </button>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                disabled={!product.isAvailable}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                  product.isAvailable
                    ? "bg-white/10 backdrop-blur-xl border-2 border-orange-500/50 text-orange-300 hover:bg-white/20 hover:border-orange-500 active:scale-95"
                    : "bg-gray-600 border-2 border-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                <span>💳</span> Mua ngay
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t border-white/10 space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚚</span>
                <span>Giao hàng miễn phí trong vòng 30 phút</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔄</span>
                <span>Đổi trả trong 1 giờ nếu không hài lòng</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <span>Hỗ trợ khách hàng 24/7 qua chatbox</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section (Optional) */}
        <div className="mt-20 pt-12 border-t border-white/10">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-8">Gợi ý khác</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/"
              className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-orange-500/50 hover:shadow-lg transition-all group text-center"
            >
              <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">🍕</span>
              <p className="text-sm font-medium text-gray-300 group-hover:text-orange-400 transition-colors">
                Xem tất cả sản phẩm
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;