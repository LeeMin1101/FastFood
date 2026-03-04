import { useParams } from "react-router-dom";

const mockProducts = [
  {
    _id: "1",
    name: "Pizza Hải Sản",
    price: 199000,
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3",
    calories: 800,
    description: "Pizza hải sản tươi ngon với phô mai kéo sợi."
  }
];

export default function ProductDetail() {
  const { id } = useParams();
  const product = mockProducts.find(p => p._id === id);

  if (!product) return <p>Không tìm thấy sản phẩm</p>;

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 grid md:grid-cols-2 gap-10">

      <img
        src={product.image}
        alt={product.name}
        className="w-full rounded-2xl shadow-lg"
      />

      <div>
        <h2 className="text-3xl font-bold mb-4">
          {product.name}
        </h2>

        <p className="text-red-500 text-2xl font-bold mb-4">
          {product.price.toLocaleString()}đ
        </p>

        <p className="mb-2">
          🔥 Calories: {product.calories} kcal
        </p>

        <p className="mb-6">
          {product.description}
        </p>

        <button className="bg-red-500 text-white px-6 py-3 rounded-xl">
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}