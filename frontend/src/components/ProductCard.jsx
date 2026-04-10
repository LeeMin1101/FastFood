import React from "react";
import { Link } from "react-router-dom";
import { SERVER_URL } from "../config";

export default function ProductCard({ product }) {
  const getImageUrl = (img) => {
    if (!img) return "https://placehold.co/400x400/ffedd5/ea580c?text=No+Image";
    if (img.startsWith("http")) return img;
    if (!img.startsWith("/")) img = "/" + img;
    return `${SERVER_URL}${img}`;
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
      <div className="relative h-56 overflow-hidden bg-gray-100 p-4 flex items-center justify-center">
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <span className="bg-gray-800 text-white font-bold px-4 py-2 rounded-lg tracking-widest uppercase text-sm">
              Hết hàng
            </span>
          </div>
        )}
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2" title={product.name}>
          {product.name}
        </h3>
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-xl font-black text-orange-600">
            {Number(product.price).toLocaleString("vi-VN")} ₫
          </span>
          
          <Link 
            to={`/product/${product._id}`} 
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${
              product.isAvailable 
                ? "bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/20" 
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            Mua ngay
          </Link>
        </div>
      </div>
    </div>
  );
}