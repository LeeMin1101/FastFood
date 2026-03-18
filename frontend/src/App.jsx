import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/admin/Dashboard";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute"; // 👉 Import Component Bảo vệ
import ChatBot from "./components/ChatBot";
import UserProfile from "./pages/UserProfile";
import Checkout from "./pages/Checkout"; 
import AuthPage from "./pages/AuthPage";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const location = useLocation();

  const hideLayoutRoutes = ["/login", "/register", "/forgot-password"];
  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 relative">
      <div className="relative z-10 flex flex-col min-h-screen">
        {!shouldHideLayout && (
          <Header user={user} setUser={setUser} />
        )}

        <ScrollToTop />

        <main className={!shouldHideLayout ? "pt-[80px] flex-1" : "flex-1"}>
          <Routes>
            {/* CÁC TRANG CÔNG KHAI (Ai xem cũng được) */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<AuthPage setUser={setUser} />} />
            <Route path="/register" element={<AuthPage setUser={setUser} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            
            {/* 🔴 CÁC TRANG BẢO MẬT (Chỉ User đã đăng nhập mới được vào) */}
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            
            {/* 🔴 CÁC TRANG QUẢN TRỊ (Chỉ Admin mới được vào) */}
            <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
          </Routes>
        </main>

        {!shouldHideLayout && (
          <>
            <Footer />
            <ChatBot />
          </>
        )}
      </div>
    </div>
  );
}

export default App;