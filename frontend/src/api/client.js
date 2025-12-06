import axios from 'axios';

/**
 * Base API URL - يمكن تغييره من environment variables
 * Default: http://localhost:3000/api
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Axios instance مع configuration أساسية
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout - increased for slower queries
});

/**
 * Request Interceptor
 * تلقائياً يضيف JWT token لكل request
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * يتعامل مع errors بشكل موحد
 */
apiClient.interceptors.response.use(
  (response) => {
    // إرجاع الـ data مباشرة للتبسيط
    return response.data;
  },
  (error) => {
    // التعامل مع 401 Unauthorized
    if (error.response?.status === 401) {
      // مسح token وإعادة التوجيه للـ login
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }

    // إرجاع error message موحد
    const errorMessage = 
      error.response?.data?.error || 
      error.response?.data?.message || 
      error.message || 
      'Something went wrong';

    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
