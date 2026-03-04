import { createSlice } from "@reduxjs/toolkit";

// 🔥 Load cart từ localStorage khi app khởi động
const savedCart = localStorage.getItem("cart");

const initialState = {
  items: savedCart ? JSON.parse(savedCart) : []
};

// 🔥 Hàm lưu cart
const saveToLocalStorage = (items) => {
  localStorage.setItem("cart", JSON.stringify(items));
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const exist = state.items.find(
        item => item._id === action.payload._id
      );

      if (exist) {
        exist.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }

      saveToLocalStorage(state.items); // 🔥 lưu lại
    },

    increaseQuantity: (state, action) => {
      const item = state.items.find(
        item => item._id === action.payload
      );

      if (item) {
        item.quantity += 1;
        saveToLocalStorage(state.items); // 🔥 lưu lại
      }
    },

    decreaseQuantity: (state, action) => {
      const item = state.items.find(
        item => item._id === action.payload
      );

      if (item && item.quantity > 1) {
        item.quantity -= 1;
        saveToLocalStorage(state.items); // 🔥 lưu lại
      }
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        item => item._id !== action.payload
      );

      saveToLocalStorage(state.items); // 🔥 lưu lại
    },

    clearCart: (state) => {
      state.items = [];
      saveToLocalStorage([]);
    }
  }
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;