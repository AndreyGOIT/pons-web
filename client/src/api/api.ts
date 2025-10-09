// client/src/api/api.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";
console.log("API_BASE", API_BASE);
// const api = axios.create({
//   baseURL: API_BASE,
//   withCredentials: true,
// });
const api = axios.create({
  baseURL: "http://localhost:5050/api",
  withCredentials: false, // временно отключаем
});

// Интерсептор для автоматической подстановки токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // используем метод set для корректной типизации
      if (config.headers) {
        (config.headers as any).Authorization = `Bearer ${token}`;
        // или в новой версии axios:
        // config.headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерсептор для глобальной обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios global error:", error);
    return Promise.reject(error);
  }
);

export default api;