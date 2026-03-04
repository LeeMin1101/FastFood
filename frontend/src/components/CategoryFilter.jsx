const categories = ["Tất cả", "Hamburger", "Pizza", "Gà Rán", "Nước Uống", "Cơm", "Combo"];

const CategoryFilter = ({ activeCategory, setCategory }) => {
  return (
    <div className="flex gap-3 flex-wrap justify-center py-4">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 shadow-sm
            ${
              activeCategory === cat
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md transform scale-105"
                : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200"
            }
          `}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;