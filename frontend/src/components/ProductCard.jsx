import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { useRef } from "react";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const imgRef = useRef(null);

  const getImageUrl = (img) => {
    if (!img) return "";
    return img.startsWith("http") ? img : `https://mtk-fastfood.onrender.com${img}`;
  };

  const flyToCart = (imgElement) => {
    const cart = document.getElementById("cart-icon");
    if (!cart || !imgElement) return;

    const imgClone = imgElement.cloneNode(true);
    const rect = imgElement.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();

    imgClone.style.position = "fixed";
    imgClone.style.left = rect.left + "px";
    imgClone.style.top = rect.top + "px";
    imgClone.style.width = rect.width + "px";
    imgClone.style.height = rect.height + "px";
    imgClone.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    imgClone.style.borderRadius = "50%";
    imgClone.style.zIndex = "9999";
    imgClone.style.pointerEvents = "none";
    imgClone.style.boxShadow = "0 10px 20px rgba(0,0,0,0.2)";

    document.body.appendChild(imgClone);

    setTimeout(() => {
      imgClone.style.left = (cartRect.left + cartRect.width / 2 - 15) + "px";
      imgClone.style.top = (cartRect.top + cartRect.height / 2 - 15) + "px";
      imgClone.style.width = "30px";
      imgClone.style.height = "30px";
      imgClone.style.opacity = "0";
    }, 50);

    setTimeout(() => {
      document.body.removeChild(imgClone);
    }, 800);
  };

  const handleAddToCart = () => {
    flyToCart(imgRef.current);
    dispatch(addToCart(product));
  };

  const handleBuyNow = () => {
    dispatch(addToCart(product));
    navigate("/cart"); 
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          ref={imgRef}
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm flex items-center gap-1 text-sm font-semibold text-gray-700">
          🔥 <span className="text-orange-600">{product.calories}</span> kcal
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>
        
        <div className="mt-auto">
          <p className="text-2xl font-extrabold text-red-500 mb-4">
            {product.price.toLocaleString('vi-VN')}đ
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToCart}
              title="Thêm vào giỏ hàng"
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 hover:text-orange-700 transition duration-300 focus:ring-2 focus:ring-orange-200"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg hover:from-orange-600 hover:to-red-700 transition duration-300 transform active:scale-95"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;