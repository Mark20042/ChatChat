import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Request Interceptor: Automatically attach Bearer token to requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the token is expired or invalid, clear token and redirect to login
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      // Optional: Redirect user to login page
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
