// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  
  // Nếu không tìm thấy thông tin user trong LocalStorage -> Đá về trang Auth
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Nếu có thì cho qua
  return children;
};

export default ProtectedRoute;