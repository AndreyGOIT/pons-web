import React from "react";
import { Navigate } from "react-router-dom";

function parseJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const base64Url = parts[1];
    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(base64Url.length + ((4 - (base64Url.length % 4)) % 4), "=");

    return JSON.parse(atob(base64));
  } catch (e) {
    console.error("Failed to parse JWT", e);
    return null;
  }
}

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
