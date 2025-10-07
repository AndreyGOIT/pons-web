// client/src/routes/TrainerRoute.jsx

import { Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
// Import function to decode JWT
import parseJwt from "../utils/parseJwt";

const TrainerRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;

  const payload = parseJwt(token);
  if (!payload || payload.exp * 1000 < Date.now()) {
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }

  // Тренер и админ могут иметь доступ
  if (payload.role !== "TRAINER" && payload.role !== "ADMIN") {
    console.warn("Access denied: trainer or admin only");
    return <Navigate to="/" replace />;
  }

  return <PrivateRoute>{children}</PrivateRoute>;
};

export default TrainerRoute;
