const sampleProducts = [
  {
    name: "Burger Bò Phô Mai",
    price: 65000,
    calories: 550,
    category: "Hamburger",
    description: "Bò nướng lửa hồng mềm mọng, phô mai Cheddar chảy xém, xà lách tươi giòn.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Burger Gà Giòn Cay",
    price: 55000,
    calories: 480,
    category: "Hamburger",
    description: "Ức gà tẩm bột chiên giòn rụm, phủ xốt cay đặc biệt và bắp cải tím.",
    image: "https://images.unsplash.com/photo-1586816001966-79b736744398?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Burger Tôm Tartar",
    price: 70000,
    calories: 420,
    category: "Hamburger",
    description: "Nhân tôm biển xay nhuyễn chiên xù, kết hợp xốt Tartar béo ngậy.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Pizza Hải Sản Nhiệt Đới",
    price: 139000,
    calories: 850,
    category: "Pizza",
    description: "Tôm, mực, thanh cua tươi ngon kết hợp phô mai Mozzarella và xốt cà chua.",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Pizza Xúc Xích Phô Mai",
    price: 119000,
    calories: 900,
    category: "Pizza",
    description: "Xúc xích Pepperoni đậm đà ngập tràn trong lớp phô mai béo ngậy.",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Đùi Gà Rán Giòn",
    price: 35000,
    calories: 320,
    category: "Gà Rán",
    description: "Đùi gà góc tư tẩm bột chiên giòn rụm, thịt bên trong mềm mọng nước.",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Cánh Gà Sốt Mắm Tỏi",
    price: 40000,
    calories: 350,
    category: "Gà Rán",
    description: "Cánh gà chiên phủ xốt nước mắm tỏi ớt đậm đà, mặn ngọt đưa miệng.",
    image: "https://images.unsplash.com/photo-1569691899455-88464f6d3310?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Gà Rán Không Xương (5 miếng)",
    price: 45000,
    calories: 400,
    category: "Gà Rán",
    description: "Gà phi lê chiên giòn, dễ ăn, thích hợp chấm xốt phô mai.",
    image: "https://images.unsplash.com/photo-1606624474011-85b463273e8e?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Cơm Gà Teriyaki",
    price: 50000,
    calories: 650,
    category: "Cơm",
    description: "Cơm dẻo ăn kèm đùi gà áp chảo xốt Teriyaki Nhật Bản mặn ngọt và salad.",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Cơm Bò Xào Hành Tây",
    price: 55000,
    calories: 600,
    category: "Cơm",
    description: "Thịt bò mềm xào hành tây thơm lừng, ăn kèm trứng ốp la và canh rong biển.",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Coca-Cola (Size L)",
    price: 20000,
    calories: 150,
    category: "Nước Uống",
    description: "Nước ngọt có ga mát lạnh, xua tan cơn khát.",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Trà Đào Cam Sả",
    price: 35000,
    calories: 120,
    category: "Nước Uống",
    description: "Trà ủ lạnh kết hợp mứt đào, cam vàng và sả tươi thanh mát.",
    image: "https://images.unsplash.com/photo-1498604212814-1180a96cd84b?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Milo Dầm Trân Châu",
    price: 30000,
    calories: 300,
    category: "Nước Uống",
    description: "Milo đậm vị cacao, dầm đá mát lạnh kèm trân châu dai giòn.",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Combo Burger Tình Bạn",
    price: 149000,
    calories: 1200,
    category: "Combo",
    description: "2 Burger Bò, 1 Khoai tây chiên (L), 2 Coca-Cola. Tiết kiệm hơn!",
    image: "https://images.unsplash.com/photo-1594991223945-8b652882c5d1?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Combo Gà Rán Gia Đình",
    price: 220000,
    calories: 2500,
    category: "Combo",
    description: "5 Miếng gà giòn, 2 Cơm, 1 Salad, 3 Coca-Cola. Bữa ăn hoàn hảo cho gia đình.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop"
  }
];

module.exports = { sampleProducts };