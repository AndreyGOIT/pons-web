// client/src/api/api.ts
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
console.log("Using API_BASE: ", API_BASE);
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// Интерцептор запросов
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;