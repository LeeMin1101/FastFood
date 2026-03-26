import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ChatBot from "./components/ChatBot";
import BackToTop from "./components/BackToTop";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentQR from "./pages/PaymentQR";
import UserProfile from "./pages/UserProfile";
import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/admin/Dashboard";
import TableOrder from "./pages/TableOrder";
import NotFound from "./pages/NotFound";

// import AIFoodScan from "./pages/AIFoodScan";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const location = useLocation();

  // Ẩn layout ở trang auth và admin
  const hideLayoutRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/admin",
    "/admin/dashboard",
  ];
  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 relative">
      <div className="relative z-10 flex flex-col min-h-screen">

        {!shouldHideLayout && (
          <Header user={user} setUser={setUser} />
        )}

        <ScrollToTop />

        <main className={!shouldHideLayout ? "pt-[80px] lg:pt-[110px] flex-1" : "flex-1"}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/login" element={<AuthPage setUser={setUser} />} />
            <Route path="/register" element={<AuthPage setUser={setUser} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/table-order" element={<TableOrder />} />

            {/* Protected */}
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            {/* page thanh toán */}
            <Route path="/payment-qr/:orderId" element={<PaymentQR />} />
            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
            
            {/* <Route path="/ai-scan" element={<AIFoodScan />} /> */}
          </Routes>
        </main>

        {!shouldHideLayout && (
          <>
            <Footer />
            <ChatBot />
            <BackToTop />
          </>
        )}

      </div>
    </div>
  );
}

export default App;