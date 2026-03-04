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
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">
        Quản lý sản phẩm
      </h2>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Tên sản phẩm"
          className="border px-3 py-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Giá"
          className="border px-3 py-2 rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button
          onClick={saveProduct}
          className="bg-green-500 text-white px-4 rounded"
        >
          {editingId ? "Cập nhật" : "Thêm"}
        </button>
      </div>

      {products.map((product) => (
        <div
          key={product.id}
          className="flex justify-between border-b py-2"
        >
          <div>
            {product.name} - {product.price}đ
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => editProduct(product)}
              className="text-blue-500"
            >
              Sửa
            </button>

            <button
              onClick={() => deleteProduct(product.id)}
              className="text-red-500"
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