// src/context/AuthProvider.jsx
import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

// Провайдер
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Загружаем из localStorage при инициализации
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Метод входа
  const login = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  // Метод выхода
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
//-------previous code--------
// const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(() => localStorage.getItem("token"));
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     if (token) {
//       fetch("/api/users/me", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })
//         .then((res) => res.json())
//         .then((data) => {
//           if (data && data.email) {
//             setUser(data);
//           } else {
//             setUser(null);
//           }
//         })
//         .catch((err) => {
//           console.error("Failed to fetch user from token:", err);
//           setUser(null);
//         });
//     }
//   }, [token]);

//   const login = (token) => {
//     localStorage.setItem("token", token);
//     setToken(token);
//     // можно сразу дернуть /api/users/me или декодировать токен, если он JWT
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     setToken(null);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ token, user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

export default AuthProvider;

// Хук для удобства
// export const useAuth = () => useContext(AuthContext);
