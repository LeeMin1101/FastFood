const categories = ["Tất cả", "Hamburger", "Pizza", "Gà Rán", "Nước Uống", "Cơm", "Combo"];

const CategoryFilter = ({ activeCategory, setCategory }) => {
  return (
    <div className="flex gap-3 flex-wrap justify-center py-6 px-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 shadow-md
            ${
              activeCategory === cat
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105"
                : "bg-white/10 text-gray-200 hover:bg-white/20 hover:text-orange-300 border border-white/20"
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