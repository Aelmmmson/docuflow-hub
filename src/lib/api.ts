// src/lib/api.ts
import axios from "axios";
import { getAccessToken, refreshAccessToken } from "./auth";   // ← add this

const api = axios.create({
  baseURL: "/v1/api/dms",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Request interceptor – add Bearer token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor – handle 401 → try refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Token was refreshed → retry original request with new token
        return api(originalRequest);
      } else {
        // Refresh failed → user should be logged out
        // You can add logout() here later if you want auto-logout on refresh fail
      }
    }

    return Promise.reject(error);
  }
);

export default api;