import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/admin/Dashboard";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatBot from "./components/ChatBot";
import UserProfile from "./pages/UserProfile";

// 👇 IMPORT TRANG CHECKOUT VÀO ĐÂY
import Checkout from "./pages/Checkout"; 

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const location = useLocation();

  // 👇 Thêm các route cần ẩn layout
  const hideLayoutRoutes = ["/login", "/register", "/forgot-password"];
  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideLayout && (
        <Header user={user} setUser={setUser} />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* 👇 THÊM ROUTE CHO TRANG THANH TOÁN */}
        <Route path="/checkout" element={<Checkout />} />
        {/* user profile ở đây */}
        <Route path="/profile" element={<UserProfile />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!shouldHideLayout && (
        <>
          <Footer />
          <ChatBot />
        </>
      )}
    </>
  );
}

export default App;