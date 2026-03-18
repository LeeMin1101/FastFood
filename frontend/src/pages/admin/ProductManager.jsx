import { useState, useEffect } from "react";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const storedProducts =
      JSON.parse(localStorage.getItem("products")) || [];
    setProducts(storedProducts);
  }, []);

  const saveProduct = () => {
    if (!name || !price) return;

    let updatedProducts;

    if (editingId) {
      updatedProducts = products.map((product) =>
        product.id === editingId
          ? { ...product, name, price }
          : product
      );
    } else {
      const newProduct = {
        id: Date.now(),
        name,
        price,
      };
      updatedProducts = [...products, newProduct];
    }

    localStorage.setItem(
      "products",
      JSON.stringify(updatedProducts)
    );
    setProducts(updatedProducts);
    setName("");
    setPrice("");
    setEditingId(null);
  };

  const editProduct = (product) => {
    setName(product.name);
    setPrice(product.price);
    setEditingId(product.id);
  };

  const deleteProduct = (id) => {
    const updatedProducts = products.filter(
      (product) => product.id !== id
    );
    localStorage.setItem(
      "products",
      JSON.stringify(updatedProducts)
    );
    setProducts(updatedProducts);
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-black mb-6 text-white">
        Quản lý sản phẩm
      </h2>

      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Tên sản phẩm"
          className="flex-1 min-w-[200px] border border-white/20 bg-white/5 px-4 py-3 rounded-xl text-white placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white/10 transition-all"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Giá"
          className="w-[150px] border border-white/20 bg-white/5 px-4 py-3 rounded-xl text-white placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white/10 transition-all"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button
          onClick={saveProduct}
          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
        >
          {editingId ? "Cập nhật" : "Thêm"}
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Chưa có sản phẩm nào</div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex justify-between items-center border-b border-white/10 py-4 hover:bg-white/5 px-4 rounded-lg transition-colors"
            >
              <div className="text-white font-medium">
                <span className="font-bold">{product.name}</span> - <span className="text-orange-300 font-black">{product.price}đ</span>
              </div>

          <div className="flex gap-3">
            <button
              onClick={() => editProduct(product)}
              className="text-orange-300 bg-orange-500/20 hover:bg-orange-500/40 font-bold px-4 py-2 rounded-lg transition-colors border border-orange-500/30"
            >
              Sửa
            </button>

            <button
              onClick={() => deleteProduct(product.id)}
              className="text-red-300 bg-red-500/20 hover:bg-red-500/40 font-bold px-4 py-2 rounded-lg transition-colors border border-red-500/30"
            >
              Xóa
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductManager;