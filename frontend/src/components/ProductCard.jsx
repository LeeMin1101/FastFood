import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { useRef } from "react";
import { motion } from "framer-motion";
import { SERVER_URL } from "../config";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const imgRef = useRef(null);

  const getImageUrl = (img) => {
    if (!img) return "/img/no-image.png";
    if (img.startsWith("http")) return img;
    if (!img.startsWith("/")) img = "/" + img;
    return `${SERVER_URL}${img}`;
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
    imgClone.style.transition = "all 0.8s cubic-bezier(0.25,0.46,0.45,0.94)";
    imgClone.style.borderRadius = "50%";
    imgClone.style.zIndex = "9999";
    imgClone.style.pointerEvents = "none";
    imgClone.style.boxShadow = "0 10px 20px rgba(255,100,0,0.3)";

    document.body.appendChild(imgClone);

    setTimeout(() => {
      imgClone.style.left =
        cartRect.left + cartRect.width / 2 - 15 + "px";
      imgClone.style.top =
        cartRect.top + cartRect.height / 2 - 15 + "px";
      imgClone.style.width = "30px";
      imgClone.style.height = "30px";
      imgClone.style.opacity = "0";
    }, 50);

    setTimeout(() => {
      document.body.removeChild(imgClone);
    }, 800);
  };

  // 🔴 CHECK LOGIN (THÊM MỚI)
  const checkLogin = () => {
    const user = localStorage.getItem("user");
    if (!user) {
      alert("Đăng nhập đi đã rồi mua 🍔, không là khỏi bấm 😏");
      navigate("/login");
      return false;
    }
    return true;
  };

  // 🔴 UPDATE LOGIC
  const handleAddToCart = () => {
    if (!checkLogin()) return;
    flyToCart(imgRef.current);
    dispatch(addToCart(product));
  };

  const handleBuyNow = () => {
    if (!checkLogin()) return;
    dispatch(addToCart(product));
    navigate("/cart");
  };

  const handleViewDetail = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 overflow-hidden group flex flex-col h-full hover:border-orange-500/50"
    >

      {/* IMAGE */}
      <div className="relative overflow-hidden aspect-[4/3] cursor-pointer group/image" onClick={handleViewDetail}>
        <img
          ref={imgRef}
          src={getImageUrl(product.image)}
          alt={product.name}
          onError={(e) => {
            e.target.src = "/img/no-image.png";
          }}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />

        <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full shadow-lg flex items-center gap-1 text-sm font-semibold text-orange-300 border border-white/20">
          🔥 <span>{product.calories}</span> kcal
        </div>

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent group-hover/image:from-black/60 transition-all flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="opacity-0 group-hover/image:opacity-100 transition-opacity"
          >
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
              Xem chi tiết
            </span>
          </motion.div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 flex flex-col flex-grow cursor-pointer" onClick={handleViewDetail}>
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-orange-400 transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-gray-300 line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>

        <div className="mt-auto">
          <p className="text-2xl font-extrabold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
            {product.price?.toLocaleString("vi-VN")}đ
          </p>

          <div className="flex items-center gap-3">
            {/* ADD TO CART */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              title="Thêm vào giỏ hàng"
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293
                  2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2
                  2 0 100 4 2 2 0 000-4zm-8
                  2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </motion.button>

            {/* BUY NOW */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBuyNow}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-4 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-orange-500/50"
            >
              Mua ngay
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;