// client/src/routes/PrivateRoute.jsx

import { Navigate } from "react-router-dom";
// Import function to decode JWT
import parseJwt from "../utils/parseJwt";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("Token is missing");
    return <Navigate to="/" replace />;
  }

  const payload = parseJwt(token);

  if (!payload) {
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }

  const isExpired = payload.exp * 1000 < Date.now();

  if (isExpired) {
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
