import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Add request interceptor to automatically include JWT token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("accessToken");
    
    if (token) {
      // Add Authorization header with Bearer token
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If token is invalid/expired, clear it and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      // You can add additional logic here like redirecting to login
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
