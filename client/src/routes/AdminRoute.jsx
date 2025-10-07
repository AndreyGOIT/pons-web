// client/src/routes/AdminRoute.jsx

import { Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
// Import function to decode JWT
import parseJwt from "../utils/parseJwt";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;

  const payload = parseJwt(token);
  if (!payload || payload.exp * 1000 < Date.now()) {
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }

  // Проверяем, что роль ADMIN
  if (payload.role !== "ADMIN") {
    console.warn("Access denied: admin only");
    return <Navigate to="/" replace />;
  }

  // Если всё ок — рендерим содержимое внутри PrivateRoute
  return <PrivateRoute>{children}</PrivateRoute>;
};

export default AdminRoute;
