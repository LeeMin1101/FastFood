import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  // Lấy thông tin user từ Redux hoặc LocalStorage
  const { user } = useSelector((state) => state.auth); 

  if (!user || user.role !== "admin") {
    // Nếu không phải admin, đá về trang chủ hoặc trang Login
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;