import api from './config';

export const authService = {
    // Register new patient
    register: async (userData) => {
        const result = await api.post('/auth/register', userData);
        if (result.data?.token) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            localStorage.setItem('userRole', result.data.user.role.toLowerCase());
        }
        return result.data;
    },

    // Login
    login: async (email, password) => {
        const result = await api.post('/auth/login', { email, password });
        if (result.data?.token) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            localStorage.setItem('userRole', result.data.user.role.toLowerCase());
        }
        return result.data;
    },

    // Verify OTP (FIXED parameter name)
    verifyOTP: async (email, otpCode) => {
        const result = await api.post('/auth/verify-otp', { email, otpCode });
        return result.data;
    },

    // Resend OTP
    resendOTP: async (email) => {
        const result = await api.post('/auth/resend-otp', { email });
        return result.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const result = await api.get('/auth/me');
        return result.data.user;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
    },

    // Helper methods (no changes)
    getStoredUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};
