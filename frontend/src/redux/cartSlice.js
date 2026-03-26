import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;

      // 👉 BẢO VỆ DỮ LIỆU: Nếu thêm nhanh từ Trang chủ (không có quantity, size), tự động gán mặc định
      const quantity = newItem.quantity || 1;
      const unitPrice = newItem.unitPrice || newItem.price;
      const totalPrice = newItem.totalPrice || (unitPrice * quantity);
      const variant = newItem.variant || ""; 
      const selectedToppings = newItem.selectedToppings || [];
      const notes = newItem.notes || "";

      // Tìm xem món này đã có trong giỏ chưa (Phải khớp ID, Size, Topping, Ghi chú)
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item._id === newItem._id &&
          (item.variant || "") === variant &&
          (item.notes || "") === notes &&
          JSON.stringify(item.selectedToppings || []) === JSON.stringify(selectedToppings)
      );

      if (existingItemIndex !== -1) {
        // Đã có món y hệt -> Cộng dồn số lượng
        state.items[existingItemIndex].quantity += quantity;
        state.items[existingItemIndex].totalPrice = state.items[existingItemIndex].unitPrice * state.items[existingItemIndex].quantity;
      } else {
        // Món mới hoàn toàn -> Thêm dòng mới vào giỏ
        state.items.push({ 
          ...newItem, 
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: totalPrice,
          variant: variant,
          selectedToppings: selectedToppings,
          notes: notes,
          cartItemId: `${newItem._id}-${Date.now()}` 
        });
      }
    },
    increaseQuantity: (state, action) => {
      const item = state.items.find((i) => i.cartItemId === action.payload || i._id === action.payload);
      if (item) {
        item.quantity += 1;
        item.totalPrice = item.unitPrice * item.quantity;
      }
    },
    decreaseQuantity: (state, action) => {
      const item = state.items.find((i) => i.cartItemId === action.payload || i._id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        item.totalPrice = item.unitPrice * item.quantity;
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.cartItemId !== action.payload && i._id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    }
  },
});

export const { addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;