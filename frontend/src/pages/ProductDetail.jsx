import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import { addToCart } from "../redux/cartSlice";
import { SERVER_URL } from "../config";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [addedToCart, setAddedToCart] = useState(false);

  const [selectedToppings, setSelectedToppings] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [note, setNote] = useState("");

  const getVariantsByCategory = (category, basePrice) => {
    if (category === "Nước Uống") {
      return [
        { name: "Size M", priceAdd: 0 },
        { name: "Size L", priceAdd: 5000 },
        { name: "Size XL", priceAdd: 10000 }
      ];
    }
    if (category === "Gà Rán") {
      return [
        { name: "Phần 1 người", priceAdd: 0 },
        { name: "Phần 2 người", priceAdd: basePrice * 0.9 },
        { name: "Phần 3 người", priceAdd: basePrice * 1.8 }
      ];
    }
    return [];
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${SERVER_URL}/api/products/${id}`);
        const productData = response.data;
        setProduct(productData);
        
        const variants = getVariantsByCategory(productData.category, productData.price);
        if (variants.length > 0) {
          setSelectedVariant(variants[0]);
        }
        
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Không tìm thấy sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && containerRef.current) {
      const headerOffset = 110;
      const elementPosition = containerRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  }, [product]);

  const getImageUrl = (img) => {
    if (!img) return "/img/no-image.png";
    if (img.startsWith("http")) return img;
    return `${SERVER_URL}${img.startsWith('/') ? img : '/' + img}`;
  };

  const handleImageHover = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
    setIsZoomed(true);
  };

  const handleImageLeave = () => setIsZoomed(false);

  const handleToppingToggle = (topping) => {
    const isSelected = selectedToppings.find(t => t._id === topping._id);
    if (isSelected) {
      setSelectedToppings(selectedToppings.filter(t => t._id !== topping._id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const calculateUnitPrice = () => {
    if (!product) return 0;
    const toppingsPrice = selectedToppings.reduce((sum, item) => sum + item.price, 0);
    const variantPrice = selectedVariant ? selectedVariant.priceAdd : 0;
    return product.price + toppingsPrice + variantPrice;
  };

  const flyToCart = () => {
    const cart = document.querySelector('a[href="/cart"]');
    if (!cart || !imageRef.current) return;
    
    const imgClone = imageRef.current.cloneNode(true);
    const rect = imageRef.current.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();

    imgClone.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      border-radius: 50%;
      z-index: 9999;
      pointer-events: none;
      box-shadow: 0 20px 40px rgba(249, 115, 22, 0.5);
    `;
    document.body.appendChild(imgClone);

    setTimeout(() => {
      imgClone.style.left = `${cartRect.left + cartRect.width / 2 - 15}px`;
      imgClone.style.top = `${cartRect.top + cartRect.height / 2 - 15}px`;
      imgClone.style.width = "30px";
      imgClone.style.height = "30px";
      imgClone.style.opacity = "0";
      imgClone.style.transform = "scale(0.1)";
    }, 50);
    setTimeout(() => document.body.removeChild(imgClone), 800);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartPayload = {
      ...product,
      quantity: quantity,
      selectedToppings: selectedToppings,
      variant: selectedVariant ? selectedVariant.name : "",
      notes: note,
      unitPrice: calculateUnitPrice(),
      totalPrice: calculateUnitPrice() * quantity
    };

    dispatch(addToCart(cartPayload));
    flyToCart();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    const directItem = {
      ...product,
      quantity: quantity,
      selectedToppings: selectedToppings,
      variant: selectedVariant ? selectedVariant.name : "",
      notes: note,
      unitPrice: calculateUnitPrice(),
      totalPrice: calculateUnitPrice() * quantity
    };

    navigate("/checkout", { state: { directItem } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-10 rounded-3xl border border-gray-200 text-center shadow-xl">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Sản phẩm không khả dụng</h2>
          <Link to="/" className="inline-block bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">Về Trang Chủ</Link>
        </div>
      </div>
    );
  }

  const unitPrice = calculateUnitPrice();
  const variants = getVariantsByCategory(product.category, product.price);

  return (
    // THAY ĐỔI BACKGROUND SANG LIGHT THEME
    <div className="min-h-screen py-24 md:py-32 relative bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={containerRef}>
        
        {/* Nút Quay Lại */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <Link to="/menu" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 font-bold transition-colors bg-white px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Quay lại thực đơn
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* HÌNH ẢNH SẢN PHẨM */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-5 relative">
            <div className="sticky top-32">
              <div 
                className="relative w-full aspect-square bg-white rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden cursor-zoom-in group"
                onMouseMove={handleImageHover}
                onMouseLeave={handleImageLeave}
              >
                <img
                  ref={imageRef}
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-300 ${isZoomed ? "scale-150" : "scale-100 group-hover:scale-105"}`}
                  style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
                />
                
                {/* Badges trên ảnh */}
                <div className="absolute top-6 left-6 flex flex-col gap-3">
                  <img src="/img/MTK.png" alt="MTK" className="w-16 h-auto drop-shadow-md opacity-90 pointer-events-none" />
                  {product.isAvailable ? (
                    <span className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md pointer-events-none tracking-wide">Sẵn sàng</span>
                  ) : (
                    <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md pointer-events-none tracking-wide">Hết hàng</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* CHI TIẾT SẢN PHẨM */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-7 flex flex-col">
            <div className="mb-2">
              <span className="text-orange-500 font-bold tracking-wider uppercase text-sm">{product.category}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">{product.name}</h1>

            <div className="mb-8 border-b border-gray-200 pb-8">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-black text-orange-600">{unitPrice.toLocaleString("vi-VN")} ₫</span>
              </div>
              <p className="text-gray-500 mt-4 leading-relaxed text-lg">{product.description}</p>
            </div>

            {/* VARIANT SELECTION (Kích cỡ/Phần ăn) */}
            {variants.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-wide">{product.category === "Nước Uống" ? "Chọn Size" : "Chọn Phần Ăn"}</h3>
                <div className="flex flex-wrap gap-3">
                  {variants.map((v, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-5 py-3 rounded-xl font-bold transition-all border-2 flex items-center gap-2 ${
                        selectedVariant?.name === v.name
                          ? "bg-orange-50 border-orange-500 text-orange-600 shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <span>{v.name}</span>
                      {v.priceAdd > 0 && <span className="text-sm font-medium opacity-80">(+{v.priceAdd.toLocaleString()}đ)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TOPPINGS */}
            {product.toppings && product.toppings.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Tùy chọn thêm (Topping)</h3>
                  <span className="text-xs text-gray-500 font-bold bg-gray-200/50 px-2 py-1 rounded">Có thể chọn nhiều</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.toppings.map((topping) => {
                    const isSelected = selectedToppings.some(t => t._id === topping._id);
                    return (
                      <button 
                        key={topping._id}
                        onClick={() => handleToppingToggle(topping)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected ? "bg-orange-50 border-orange-500 text-gray-900 shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${isSelected ? "bg-orange-500 border-orange-500" : "border-gray-300 bg-white"}`}>
                            {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="font-bold text-sm">{topping.name}</span>
                        </div>
                        <span className={`text-sm font-black ${isSelected ? "text-orange-600" : "text-gray-500"}`}>+{topping.price.toLocaleString("vi-VN")} ₫</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* GHI CHÚ BẾP */}
            <div className="mb-8">
              <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-wide">Ghi chú đặc biệt</h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Không hành, nhiều tương ớt, ít đá..."
                className="w-full h-24 bg-white border border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none transition-all text-sm shadow-sm"
              />
            </div>

            {/* ACTION BAR (Thanh công cụ đặt hàng dính đáy) */}
            <div className="mt-auto bg-white/90 backdrop-blur-xl border border-gray-200 p-4 sm:p-5 rounded-2xl sticky bottom-4 z-20 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                
                {/* Tăng giảm số lượng */}
                <div className="flex items-center justify-between w-full sm:w-1/3 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="w-10 h-10 flex items-center justify-center text-xl font-bold text-gray-700 bg-white shadow-sm hover:text-orange-500 rounded-lg disabled:opacity-50 transition-colors">
                    −
                  </button>
                  <span className="text-xl font-black text-gray-900 w-12 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-xl font-bold text-gray-700 bg-white shadow-sm hover:text-orange-500 rounded-lg transition-colors">
                    +
                  </button>
                </div>

                <div className="flex flex-1 w-full gap-3">
                  {/* Nút Thêm vào giỏ */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.isAvailable}
                    className={`flex-1 py-3 sm:py-4 px-2 rounded-xl font-black uppercase tracking-wider text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 border-2 ${
                      addedToCart 
                        ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30" 
                        : product.isAvailable 
                          ? "bg-white text-gray-700 border-gray-200 hover:border-orange-500 hover:text-orange-600 shadow-sm" 
                          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    }`}
                  >
                    {addedToCart ? "✓ Đã thêm" : "Thêm vào giỏ"}
                  </button>

                  {/* Nút Mua ngay */}
                  <button
                    onClick={handleBuyNow}
                    disabled={!product.isAvailable}
                    className={`flex-[1.5] py-3 sm:py-4 px-2 rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                      product.isAvailable 
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-red-600" 
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Mua Ngay • {(unitPrice * quantity).toLocaleString("vi-VN")} ₫
                  </button>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}