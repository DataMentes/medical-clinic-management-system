import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - add auth token
api.interceptors.request.use(
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

// Response interceptor - unwrap data and handle errors
api.interceptors.response.use(
    (response) => {
        // Auto-unwrap response.data for cleaner service code
        return response.data;
    },
    (error) => {
        // Handle 401 - Unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            window.location.href = '/login';
        }
        
        // Enhance error object with backend message
        if (error.response?.data) {
            error.message = error.response.data.error || error.message;
        }
        
        return Promise.reject(error);
    }
);

export default api;
