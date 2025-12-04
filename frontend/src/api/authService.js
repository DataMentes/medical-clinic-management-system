import api from './config';

export const authService = {
    // Register new patient
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('userRole', response.data.user.role.toLowerCase());
        }
        return response.data;
    },

    // Login
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        console.log(response.data);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('userRole', response.data.user.role.toLowerCase());
        }
        return response.data;
    },

    // Send OTP 
    sendOTP: async (email) => {
        const response = await api.post('/auth/send-otp', { email });
        return response.data;
    },

    // Verify OTP
    verifyOTP: async (email, code) => {
        const response = await api.post('/auth/verify-otp', { email, code });
        return response.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data.user;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
    },

    // Get stored user
    getStoredUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Get stored token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Check if authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};
